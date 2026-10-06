import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiErrorMessage } from '../../core/interceptors/error.interceptor';
import { FlightSchedule, UpsertFlightSchedule } from '../../core/models/models';
import { AdminService } from '../../core/services/admin.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ToastService } from '../../core/services/toast.service';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DurationPipe, InrPipe } from '../../shared/pipes/format.pipes';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  selector: 'at-admin-flights',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent, InrPipe, DurationPipe, DrawerComponent],
  templateUrl: './admin-flights.component.html',
  styleUrls: ['./admin-shared.scss', './admin-flights.component.scss'],
})
export class AdminFlightsComponent {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);

  protected readonly airports = toSignal(this.catalog.airports$, { initialValue: [] });
  protected readonly airlines = toSignal(this.catalog.airlines$, { initialValue: [] });
  protected readonly dayLabels = DAY_LABELS;
  protected readonly dayNames = DAY_NAMES;

  protected readonly flights = signal<FlightSchedule[] | null>(null);
  protected readonly query = signal('');
  protected readonly airlineFilter = signal('');
  protected readonly showInactive = signal(true);

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return (this.flights() ?? []).filter((f) =>
      (!this.airlineFilter() || f.airlineCode === this.airlineFilter()) &&
      (this.showInactive() || f.isActive) &&
      (!q || f.flightNumber.toLowerCase().includes(q) || f.origin.toLowerCase() === q || f.destination.toLowerCase() === q ||
        f.originCity.toLowerCase().includes(q) || f.destinationCity.toLowerCase().includes(q) || `${f.origin}-${f.destination}`.toLowerCase() === q));
  });
  protected readonly activeCount = computed(() => (this.flights() ?? []).filter((f) => f.isActive).length);

  // ---- Drawer form ----
  protected readonly editing = signal<FlightSchedule | null>(null);
  protected readonly drawerOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly days = signal<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));

  protected readonly form = this.fb.nonNullable.group({
    airlineCode: ['SF', Validators.required],
    flightNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{2}\d{2,4}$/)]],
    origin: ['DEL', Validators.required],
    destination: ['BOM', Validators.required],
    departureTime: ['06:00', Validators.required],
    durationMinutes: [120, [Validators.required, Validators.min(30), Validators.max(1200)]],
    aircraft: ['Airbus A320neo', Validators.required],
    economyFare: [4500, [Validators.required, Validators.min(500)]],
    economySeats: [156, [Validators.required, Validators.min(1)]],
    premiumEconomyFare: this.fb.control<number | null>(null),
    premiumEconomySeats: [0, Validators.min(0)],
    businessFare: this.fb.control<number | null>(null),
    businessSeats: [0, Validators.min(0)],
    checkInBaggageKg: [15, [Validators.required, Validators.min(0)]],
    mealIncluded: [false],
    isActive: [true],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.admin.flights().subscribe((f) => this.flights.set(f));
  }

  daysLabel(days: number[]): string {
    return days.length === 7 ? 'Daily' : `${days.length} days a week`;
  }

  openCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.form.reset();
    this.form.patchValue({ flightNumber: 'SF' });
    this.days.set(new Set([0, 1, 2, 3, 4, 5, 6]));
    this.drawerOpen.set(true);
  }

  openEdit(f: FlightSchedule): void {
    this.editing.set(f);
    this.formError.set(null);
    this.form.reset({
      airlineCode: f.airlineCode, flightNumber: f.flightNumber, origin: f.origin, destination: f.destination, departureTime: f.departureTime,
      durationMinutes: f.durationMinutes, aircraft: f.aircraft, economyFare: f.economyFare, economySeats: f.economySeats,
      premiumEconomyFare: f.premiumEconomyFare, premiumEconomySeats: f.premiumEconomySeats, businessFare: f.businessFare, businessSeats: f.businessSeats,
      checkInBaggageKg: f.checkInBaggageKg, mealIncluded: f.mealIncluded, isActive: f.isActive,
    });
    this.days.set(new Set(f.operatingDays));
    this.drawerOpen.set(true);
  }

  toggleDay(d: number): void {
    this.days.update((s) => {
      const next = new Set(s);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  toggleActive(f: FlightSchedule): void {
    this.admin.setFlightActive(f.id, !f.isActive).subscribe((updated) => {
      this.flights.update((list) => (list ?? []).map((x) => (x.id === updated.id ? updated : x)));
      this.toast.success(`${updated.flightNumber} ${updated.isActive ? 'is back on sale' : 'is suspended and hidden from search'}.`);
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.days().size === 0) { this.formError.set('Pick at least one operating day.'); return; }
    const v = this.form.getRawValue();
    const body: UpsertFlightSchedule = {
      ...v,
      flightNumber: v.flightNumber.toUpperCase(),
      operatingDays: [...this.days()].sort(),
      premiumEconomyFare: v.premiumEconomySeats > 0 ? v.premiumEconomyFare : null,
      businessFare: v.businessSeats > 0 ? v.businessFare : null,
    };
    this.saving.set(true);
    this.formError.set(null);
    const editing = this.editing();
    const req = editing ? this.admin.updateFlight(editing.id, body) : this.admin.createFlight(body);
    req.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.drawerOpen.set(false);
        this.flights.update((list) => editing ? (list ?? []).map((x) => (x.id === saved.id ? saved : x)) : [saved, ...(list ?? [])]);
        this.toast.success(editing ? `${saved.flightNumber} updated.` : `${saved.flightNumber} added. It's now bookable in search.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(apiErrorMessage(err));
      },
    });
  }
}
