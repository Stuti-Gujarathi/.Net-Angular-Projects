import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Booking } from '../../core/models/models';
import { BookingService } from '../../core/services/booking.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SearchFormComponent } from '../../shared/components/search-form/search-form.component';
import { InrPipe, TimePipe } from '../../shared/pipes/format.pipes';
import { TripRowComponent } from './trip-row.component';

@Component({
  selector: 'at-account-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, IconComponent, InrPipe, TimePipe, TripRowComponent, SearchFormComponent],
  templateUrl: './account-overview.component.html',
  styleUrl: './account-overview.component.scss',
})
export class AccountOverviewComponent {
  protected readonly bookings = toSignal(inject(BookingService).mine().pipe(catchError(() => of([] as Booking[]))));

  protected readonly upcoming = computed(() =>
    (this.bookings() ?? []).filter((b) => b.isUpcoming && b.status === 'Confirmed').sort((a, b) => a.segments[0].departure.localeCompare(b.segments[0].departure)));
  protected readonly nextTrip = computed(() => this.upcoming()[0] ?? null);
  protected readonly pending = computed(() => (this.bookings() ?? []).filter((b) => b.status === 'PendingPayment'));
  protected readonly completed = computed(() => (this.bookings() ?? []).filter((b) => b.status === 'Confirmed' && !b.isUpcoming).length);
  protected readonly spent = computed(() =>
    (this.bookings() ?? []).filter((b) => b.paidAt).reduce((sum, b) => sum + b.fare.total - b.refundAmount, 0));
  /** Loyalty: 5 AeroMiles per ₹100 spent. */
  protected readonly miles = computed(() => Math.floor(this.spent() / 100) * 5);
  protected readonly recent = computed(() => (this.bookings() ?? []).slice(0, 4));

  protected readonly daysToNext = computed(() => {
    const t = this.nextTrip();
    if (!t) return 0;
    const dep = new Date(t.segments[0].departure.slice(0, 10) + 'T00:00:00').getTime();
    const today = new Date(new Date().toDateString()).getTime();
    return Math.max(0, Math.round((dep - today) / 86_400_000));
  });
}
