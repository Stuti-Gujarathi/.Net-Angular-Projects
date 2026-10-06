import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/interceptors/error.interceptor';
import { Booking, CABIN_LABELS, CancellationQuote, STATUS_LABELS } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/components/drawer/drawer.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DayShiftPipe, DurationPipe, InrPipe, TimePipe } from '../../shared/pipes/format.pipes';
import { BookingStepsComponent } from './booking-steps.component';

/** E-ticket / booking detail. Also the confirmation screen right after payment (?new=1). */
@Component({
  selector: 'at-ticket',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, IconComponent, InrPipe, DurationPipe, TimePipe, DayShiftPipe, ModalComponent, BookingStepsComponent],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss',
})
export class TicketComponent implements OnInit {
  private readonly bookings = inject(BookingService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  readonly bookingId = input.required<string>();
  readonly new = input<string | undefined>(undefined);

  protected readonly cabinLabels = CABIN_LABELS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly booking = signal<Booking | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly cancelOpen = signal(false);
  protected readonly cancelQuote = signal<CancellationQuote | null>(null);
  protected readonly cancelling = signal(false);

  protected readonly justBooked = computed(() => this.new() === '1' && this.booking()?.status === 'Confirmed');
  protected readonly destinationCity = computed(() => {
    const b = this.booking();
    return b ? b.segments[b.segments.length - 1].destinationCity : '';
  });
  protected readonly isPast = computed(() => {
    const b = this.booking();
    return !!b && b.status === 'Confirmed' && !b.isUpcoming;
  });

  ngOnInit(): void {
    this.bookings.get(this.bookingId()).subscribe({
      next: (b) => this.booking.set(b),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  print(): void {
    window.print();
  }

  openCancel(): void {
    this.cancelQuote.set(null);
    this.cancelOpen.set(true);
    this.bookings.cancellationQuote(this.bookingId()).subscribe({
      next: (q) => this.cancelQuote.set(q),
      error: () => this.cancelOpen.set(false),
    });
  }

  confirmCancel(): void {
    this.cancelling.set(true);
    this.bookings.cancel(this.bookingId()).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.cancelling.set(false);
        this.cancelOpen.set(false);
        this.toast.success(b.refundAmount > 0 ? `Booking cancelled. ₹${b.refundAmount.toLocaleString('en-IN')} will be refunded in 5–7 days.` : 'Booking cancelled.');
      },
      error: () => this.cancelling.set(false),
    });
  }

  completePayment(): void {
    this.router.navigate(['/payment', this.bookingId()]);
  }
}
