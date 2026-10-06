import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { FeelingStore } from '../../core/feeling-store';
import { DurationPipe, InrPipe, TravelDatePipe } from '../../core/format';
import { JourneyApi } from '../../core/journey-api';
import { liveMatches } from '../../core/live-matches';
import { DiscoveryMatch, JourneySummary } from '../../core/models';
import { Mood } from '../../core/mood';
import { FeelingPanel } from '../../shared/feeling-panel/feeling-panel';
import { Porthole } from '../../shared/porthole/porthole';
import { FlightInfo } from '../../shared/window-seat/flight-info';
import { WindowSeat, WindowView } from '../../shared/window-seat/window-seat';

interface BrandPromise {
  title: string;
  detail: string;
}

@Component({
  selector: 'sgt-home-page',
  imports: [RouterLink, WindowSeat, FlightInfo, FeelingPanel, Porthole, InrPipe, TravelDatePipe, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly api = inject(JourneyApi);
  private readonly router = inject(Router);
  private readonly mood = inject(Mood);
  protected readonly store = inject(FeelingStore);

  protected readonly live = liveMatches(3);
  protected readonly shadeOpen = signal(false);
  protected readonly top = computed<DiscoveryMatch | null>(() => this.live.matches()[0] ?? null);
  protected readonly topSlug = computed(() => this.top()?.journey.slug ?? null);

  protected readonly views = toSignal(
    this.api.journeys().pipe(
      map((list): WindowView[] => list.map((j) => ({ slug: j.slug, theme: j.theme, label: `The view over ${j.destination}: ${j.tagline}` }))),
      catchError(() => of<WindowView[]>([])),
    ),
    { initialValue: [] },
  );

  /** undefined while loading, null on failure. */
  protected readonly departing = toSignal(
    this.api.featured().pipe(
      map((list): JourneySummary[] | null => list.filter((j) => j.nextDeparture).slice(0, 5)),
      catchError(() => of(null)),
    ),
  );

  protected readonly promises: BrandPromise[] = [
    { title: 'An Indian Tour Manager', detail: 'With your group from arrival to departure, not just at the airport.' },
    { title: 'Visa paperwork, handled', detail: 'A checklist made for your passport, and a second pair of eyes before you submit.' },
    { title: 'Meals you will want', detail: 'Indian, Jain and local menus, planned around the day.' },
    { title: 'A private coach', detail: "Your group's own coach, so luggage never rides the metro." },
    { title: 'Stays that are part of the trip', detail: 'Central hotels, plus a ryokan, a glass igloo or a tented camp where it counts.' },
  ];

  constructor() {
    // Moving any dial opens the shade, so the first interaction always shows its effect.
    effect(() => {
      if (this.store.touched()) this.shadeOpen.set(true);
    });

    effect(() => {
      const top = this.top();
      this.mood.set(this.shadeOpen() && top ? top.journey.theme.accent : null);
    });
  }

  protected seeMatches(): void {
    this.router.navigate(['/discover'], { queryParams: this.store.toQueryParams() });
  }
}
