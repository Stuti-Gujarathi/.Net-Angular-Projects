import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { CABIN_LABELS, CabinClass, FareCalendarDay, FlightSearchResponse, Itinerary, SearchParams } from '../../core/models/models';
import { FlightService } from '../../core/services/flight.service';
import { apiErrorMessage } from '../../core/interceptors/error.interceptor';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SearchFormComponent, isoDate } from '../../shared/components/search-form/search-form.component';
import { DurationPipe, InrPipe } from '../../shared/pipes/format.pipes';
import { FlightCardComponent } from './flight-card.component';

type SortKey = 'best' | 'cheapest' | 'fastest' | 'earliest';
type TimeBucket = 'early' | 'morning' | 'afternoon' | 'evening';

const BUCKETS: { key: TimeBucket; label: string; range: string; icon: string; from: number; to: number }[] = [
  { key: 'early', label: 'Early', range: '00–06', icon: 'moon', from: 0, to: 6 },
  { key: 'morning', label: 'Morning', range: '06–12', icon: 'sunrise', from: 6, to: 12 },
  { key: 'afternoon', label: 'Afternoon', range: '12–18', icon: 'sun', from: 12, to: 18 },
  { key: 'evening', label: 'Evening', range: '18–24', icon: 'sunset', from: 18, to: 24 },
];

@Component({
  selector: 'at-flight-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlightCardComponent, SearchFormComponent, IconComponent, InrPipe, DurationPipe, DatePipe, RouterLink],
  templateUrl: './flight-results.component.html',
  styleUrl: './flight-results.component.scss',
})
export class FlightResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly flights = inject(FlightService);

  protected readonly cabinLabels = CABIN_LABELS;
  protected readonly buckets = BUCKETS;

  protected readonly params = toSignal(
    this.route.queryParamMap.pipe(
      map((q): SearchParams | null => {
        const from = q.get('from'), to = q.get('to'), date = q.get('date');
        if (!from || !to || !date) return null;
        return { from, to, date, pax: Math.min(9, Math.max(1, Number(q.get('pax')) || 1)), cabin: (q.get('cabin') as CabinClass) || 'Economy' };
      }),
    ),
    { initialValue: null },
  );

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly data = signal<FlightSearchResponse | null>(null);
  protected readonly calendar = signal<FareCalendarDay[]>([]);
  protected readonly modifyOpen = signal(false);
  protected readonly filtersOpen = signal(false);
  protected readonly expandedId = signal<string | null>(null);

  // ---- Filters & sort ----
  protected readonly sort = signal<SortKey>('best');
  protected readonly stops = signal<Set<number>>(new Set());
  protected readonly airlines = signal<Set<string>>(new Set());
  protected readonly times = signal<Set<TimeBucket>>(new Set());
  protected readonly maxPrice = signal<number | null>(null);
  protected readonly refundableOnly = signal(false);

  protected readonly results = computed(() => this.data()?.results ?? []);
  protected readonly priceBounds = computed(() => {
    const fares = this.results().map((r) => r.farePerAdult);
    return fares.length ? { min: Math.min(...fares), max: Math.max(...fares) } : { min: 0, max: 0 };
  });

  protected readonly stopOptions = computed(() => [0, 1].map((n) => {
    const matches = this.results().filter((r) => r.stops === n);
    return { value: n, label: n === 0 ? 'Non-stop' : '1 stop', count: matches.length, min: matches.length ? Math.min(...matches.map((m) => m.farePerAdult)) : null };
  }));

  protected readonly airlineOptions = computed(() => {
    const map = new Map<string, { code: string; name: string; color: string; min: number; count: number }>();
    for (const r of this.results()) {
      for (const s of r.segments) {
        const cur = map.get(s.airlineCode);
        if (!cur) map.set(s.airlineCode, { code: s.airlineCode, name: s.airlineName, color: s.airlineColor, min: r.farePerAdult, count: 1 });
        else { cur.min = Math.min(cur.min, r.farePerAdult); cur.count++; }
      }
    }
    return [...map.values()].sort((a, b) => a.min - b.min);
  });

  protected readonly filtered = computed(() => {
    const stops = this.stops(), airlines = this.airlines(), times = this.times(), max = this.maxPrice(), refundable = this.refundableOnly();
    return this.results().filter((r) => {
      if (stops.size && !stops.has(r.stops)) return false;
      if (airlines.size && !r.segments.every((s) => airlines.has(s.airlineCode))) return false;
      if (times.size) {
        const hour = Number(r.departure.slice(11, 13));
        const bucket = BUCKETS.find((b) => hour >= b.from && hour < b.to)!.key;
        if (!times.has(bucket)) return false;
      }
      if (max !== null && r.farePerAdult > max) return false;
      if (refundable && !r.refundable) return false;
      return true;
    });
  });

  protected readonly sorted = computed(() => sortBy(this.filtered(), this.sort()));
  protected readonly sortTabs = computed(() => (['best', 'cheapest', 'fastest', 'earliest'] as SortKey[]).map((key) => {
    const top = sortBy(this.filtered(), key)[0];
    return { key, label: { best: 'Best', cheapest: 'Cheapest', fastest: 'Fastest', earliest: 'Earliest' }[key], top };
  }));
  protected readonly activeFilterCount = computed(() =>
    this.stops().size + this.airlines().size + this.times().size + (this.maxPrice() !== null ? 1 : 0) + (this.refundableOnly() ? 1 : 0));

  constructor() {
    this.route.queryParamMap
      .pipe(
        map(() => this.params()),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap((p) => {
          this.resetFilters();
          this.modifyOpen.set(!p);
          this.error.set(null);
          this.data.set(null);
          this.loading.set(!!p);
        }),
        switchMap((p) => {
          if (!p) return of(null);
          this.loadCalendar(p);
          return this.flights.search(p).pipe(catchError((err) => { this.error.set(apiErrorMessage(err)); return of(null); }));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.loading.set(false);
        this.data.set(res);
      });
  }

  toggleStop(value: number): void {
    this.stops.update((s) => toggled(s, value));
  }

  toggleAirline(code: string): void {
    this.airlines.update((s) => toggled(s, code));
  }

  toggleTime(bucket: TimeBucket): void {
    this.times.update((s) => toggled(s, bucket));
  }

  resetFilters(): void {
    this.stops.set(new Set());
    this.airlines.set(new Set());
    this.times.set(new Set());
    this.maxPrice.set(null);
    this.refundableOnly.set(false);
  }

  pickDate(day: FareCalendarDay): void {
    if (day.lowestFare === null) return;
    this.router.navigate([], { queryParams: { date: day.date }, queryParamsHandling: 'merge' });
  }

  book(it: Itinerary): void {
    const p = this.params()!;
    this.router.navigate(['/booking', it.id], { queryParams: { cabin: p.cabin, pax: p.pax } });
  }

  toggleExpanded(id: string): void {
    this.expandedId.update((cur) => (cur === id ? null : id));
  }

  private loadCalendar(p: SearchParams): void {
    const today = isoDate(new Date());
    const start = new Date(p.date + 'T00:00:00');
    start.setDate(start.getDate() - 3);
    const startIso = isoDate(start) < today ? today : isoDate(start);
    this.calendar.set([]);
    this.flights.fareCalendar(p.from, p.to, startIso, 7, p.cabin).pipe(catchError(() => of([]))).subscribe((days) => this.calendar.set(days));
  }
}

function toggled<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function sortBy(list: Itinerary[], key: SortKey): Itinerary[] {
  const copy = [...list];
  if (!copy.length) return copy;
  const minFare = Math.min(...copy.map((r) => r.farePerAdult));
  const minDur = Math.min(...copy.map((r) => r.totalDurationMinutes));
  const score = (r: Itinerary) => (r.farePerAdult / minFare) * 0.6 + (r.totalDurationMinutes / minDur) * 0.4;
  switch (key) {
    case 'cheapest': return copy.sort((a, b) => a.farePerAdult - b.farePerAdult);
    case 'fastest': return copy.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
    case 'earliest': return copy.sort((a, b) => a.departure.localeCompare(b.departure));
    default: return copy.sort((a, b) => score(a) - score(b));
  }
}
