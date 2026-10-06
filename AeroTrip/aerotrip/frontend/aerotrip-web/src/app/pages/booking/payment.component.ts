import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/interceptors/error.interceptor';
import { Booking, CABIN_LABELS, PaymentMethod, PaymentRequest } from '../../core/models/models';
import { BookingService } from '../../core/services/booking.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InrPipe, TimePipe } from '../../shared/pipes/format.pipes';
import { BookingStepsComponent } from './booking-steps.component';

const BANKS = [
  { code: 'HDFC', name: 'HDFC Bank', color: '#004c8f' },
  { code: 'ICICI', name: 'ICICI Bank', color: '#ae282e' },
  { code: 'SBI', name: 'State Bank of India', color: '#1a4c9c' },
  { code: 'AXIS', name: 'Axis Bank', color: '#97144d' },
  { code: 'KOTAK', name: 'Kotak Mahindra', color: '#ed1c24' },
];

@Component({
  selector: 'at-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, IconComponent, InrPipe, TimePipe, BookingStepsComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bookings = inject(BookingService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bookingId = input.required<string>();

  protected readonly cabinLabels = CABIN_LABELS;
  protected readonly banks = BANKS;
  protected readonly booking = signal<Booking | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly method = signal<PaymentMethod>('Card');
  protected readonly bank = signal<string | null>(null);
  protected readonly paying = signal(false);
  protected readonly payError = signal<string | null>(null);
  protected readonly testOpen = signal(false);
  protected readonly now = signal(Date.now());
  private holdEndsAt = 0;

  protected readonly secondsLeft = computed(() => Math.max(0, Math.floor((this.holdEndsAt - this.now()) / 1000)));
  protected readonly countdown = computed(() => {
    const s = this.secondsLeft();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });
  protected readonly holdPct = computed(() => Math.min(100, (this.secondsLeft() / (15 * 60)) * 100));
  protected readonly expired = computed(() => !!this.booking() && this.secondsLeft() === 0);

  protected readonly card = this.fb.nonNullable.group({
    number: ['', [Validators.required, Validators.pattern(/^[\d ]{15,23}$/)]],
    nameOnCard: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });
  protected readonly upi = this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)]);

  protected readonly cardPreview = signal({ number: '', name: '', expiry: '' });
  protected readonly brand = computed(() => {
    const n = this.cardPreview().number.replace(/\s/g, '');
    if (n.startsWith('4')) return 'VISA';
    if (/^(5|2)/.test(n)) return 'Mastercard';
    if (n.startsWith('6')) return 'RuPay';
    if (n.startsWith('3')) return 'AMEX';
    return '';
  });

  ngOnInit(): void {
    this.bookings.get(this.bookingId()).subscribe({
      next: (b) => {
        if (b.status === 'Confirmed') {
          this.router.navigate(['/trips', b.id]);
          return;
        }
        this.booking.set(b);
        this.holdEndsAt = Date.now() + b.holdSecondsLeft * 1000;
        this.now.set(Date.now());
        const id = setInterval(() => this.now.set(Date.now()), 1000);
        this.destroyRef.onDestroy(() => clearInterval(id));
        this.card.patchValue({ nameOnCard: b.travellerName.toUpperCase() });
        this.cardPreview.update((p) => ({ ...p, name: b.travellerName.toUpperCase() }));
      },
      error: (err) => this.loadError.set(apiErrorMessage(err)),
    });

    this.card.valueChanges.subscribe((v) => this.cardPreview.set({ number: v.number ?? '', name: v.nameOnCard ?? '', expiry: v.expiry ?? '' }));
  }

  formatNumber(event: Event): void {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '').slice(0, 19);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.card.controls.number.setValue(formatted);
  }

  formatExpiry(event: Event): void {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '').slice(0, 4);
    this.card.controls.expiry.setValue(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  }

  useTest(kind: 'ok' | 'decline' | 'upi-ok' | 'upi-fail'): void {
    this.payError.set(null);
    if (kind === 'ok' || kind === 'decline') {
      this.method.set('Card');
      this.card.patchValue({ number: kind === 'ok' ? '4111 1111 1111 1111' : '4000 0000 0000 0002', expiry: '12/29', cvv: '123' });
    } else {
      this.method.set('Upi');
      this.upi.setValue(kind === 'upi-ok' ? 'riya@okaxis' : 'fail@okaxis');
    }
  }

  pay(): void {
    const b = this.booking();
    if (!b || this.expired()) return;
    const request: PaymentRequest = { bookingId: b.id, method: this.method() };

    if (this.method() === 'Card') {
      if (this.card.invalid) { this.card.markAllAsTouched(); return; }
      request.card = this.card.getRawValue();
    } else if (this.method() === 'Upi') {
      if (this.upi.invalid) { this.upi.markAsTouched(); return; }
      request.upiId = this.upi.value;
    } else {
      if (!this.bank()) { this.payError.set('Choose your bank to continue.'); return; }
      request.bankCode = this.bank()!;
    }

    this.paying.set(true);
    this.payError.set(null);
    this.bookings.pay(request).subscribe({
      next: (res) => {
        this.paying.set(false);
        if (res.success) {
          this.toast.success(res.message);
          this.router.navigate(['/trips', res.booking.id], { queryParams: { new: 1 } });
        } else {
          this.payError.set(res.message);
        }
      },
      error: (err) => {
        this.paying.set(false);
        this.payError.set(apiErrorMessage(err));
      },
    });
  }
}
