import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, filter, of, switchMap } from 'rxjs';
import { apiErrorMessage } from '../../core/interceptors/error.interceptor';
import { CABIN_LABELS, CabinClass, Extras, Gender, Itinerary, Offer, PriceQuote, SeatPreference } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { CatalogService } from '../../core/services/catalog.service';
import { FlightService } from '../../core/services/flight.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DayShiftPipe, DurationPipe, InrPipe, TimePipe } from '../../shared/pipes/format.pipes';
import { BookingStepsComponent } from './booking-steps.component';

type PassengerForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  gender: FormControl<Gender>;
  age: FormControl<number | null>;
}>;

@Component({
  selector: 'at-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, IconComponent, InrPipe, DurationPipe, TimePipe, DayShiftPipe, BookingStepsComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly flights = inject(FlightService);
  private readonly bookings = inject(BookingService);
  protected readonly auth = inject(AuthService);

  // Bound from the route: /booking/:itineraryId?cabin=&pax=
  readonly itineraryId = input.required<string>();
  readonly cabin = input<CabinClass>('Economy');
  readonly pax = input<string>('1');

  protected readonly cabinLabels = CABIN_LABELS;
  protected readonly passengerCount = computed(() => Math.min(9, Math.max(1, Number(this.pax()) || 1)));
  protected readonly itinerary = signal<Itinerary | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);

  // ---- Extras + coupon drive a live server-side quote ----
  protected readonly extras = signal<Extras>({ extraBaggage: false, meal: false, travelInsurance: false, flexibleDateChange: false, seatPreference: 'NoPreference' });
  protected readonly couponInput = signal('');
  protected readonly couponCode = signal<string | null>(null);
  protected readonly quote = signal<PriceQuote | null>(null);
  protected readonly offers = toSignal(inject(CatalogService).offers().pipe(catchError(() => of([] as Offer[]))), { initialValue: [] as Offer[] });

  protected readonly mealsIncluded = computed(() => this.itinerary()?.segments.every((s) => s.mealIncluded) ?? false);
  protected readonly couponApplied = computed(() => !!this.quote()?.couponValid);
  protected readonly seatPrefs: { value: SeatPreference; label: string }[] = [
    { value: 'NoPreference', label: 'No preference' },
    { value: 'Window', label: 'Window' },
    { value: 'Aisle', label: 'Aisle' },
  ];

  private readonly quoteRequest = computed(() => {
    const it = this.itinerary();
    if (!it) return null;
    return { itineraryId: it.id, cabin: this.cabin(), passengers: this.passengerCount(), extras: this.extras(), couponCode: this.couponCode() };
  });

  protected readonly form = this.fb.nonNullable.group({
    passengers: this.fb.array<PassengerForm>([]),
    contactEmail: ['', [Validators.required, Validators.email]],
    contactPhone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
  });

  get passengers(): FormArray<PassengerForm> {
    return this.form.controls.passengers;
  }

  constructor() {
    toObservable(this.quoteRequest)
      .pipe(
        filter((r) => r !== null),
        debounceTime(200),
        switchMap((r) => this.bookings.quote(r!).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((q) => {
        if (q) this.quote.set(q);
      });
  }

  ngOnInit(): void {
    const user = this.auth.user();
    const names = (user?.fullName ?? '').split(' ');
    for (let i = 0; i < this.passengerCount(); i++) {
      this.passengers.push(this.fb.nonNullable.group({
        firstName: [i === 0 ? names[0] ?? '' : '', [Validators.required, Validators.maxLength(40)]],
        lastName: [i === 0 ? names.slice(1).join(' ') : '', [Validators.required, Validators.maxLength(40)]],
        gender: ['Female' as Gender, Validators.required],
        age: this.fb.control<number | null>(null, [Validators.required, Validators.min(2), Validators.max(110)]),
      }) as PassengerForm);
    }
    this.form.patchValue({ contactEmail: user?.email ?? '', contactPhone: user?.phone ?? '' });

    this.flights.itinerary(this.itineraryId(), this.cabin(), this.passengerCount()).subscribe({
      next: (it) => this.itinerary.set(it),
      error: (err) => this.loadError.set(apiErrorMessage(err)),
    });
  }

  toggleExtra(key: Exclude<keyof Extras, 'seatPreference'>): void {
    this.extras.update((e) => ({ ...e, [key]: !e[key] }));
  }

  setSeat(pref: SeatPreference): void {
    this.extras.update((e) => ({ ...e, seatPreference: pref }));
  }

  applyCoupon(code?: string): void {
    const value = (code ?? this.couponInput()).trim().toUpperCase();
    if (!value) return;
    this.couponInput.set(value);
    this.couponCode.set(value);
  }

  removeCoupon(): void {
    this.couponCode.set(null);
    this.couponInput.set('');
  }

  submit(): void {
    if (this.form.invalid || !this.itinerary()) {
      this.form.markAllAsTouched();
      document.querySelector('.ng-invalid.ng-touched')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.bookings
      .create({
        itineraryId: this.itinerary()!.id,
        cabin: this.cabin(),
        passengers: v.passengers.map((p) => ({ firstName: p.firstName, lastName: p.lastName, gender: p.gender, age: Number(p.age) })),
        contactEmail: v.contactEmail,
        contactPhone: v.contactPhone,
        extras: this.extras(),
        couponCode: this.couponApplied() ? this.couponCode() : null,
      })
      .subscribe({
        next: (booking) => this.router.navigate(['/payment', booking.id]),
        error: () => this.submitting.set(false),
      });
  }
}
