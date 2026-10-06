import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Booking } from '../../core/models/models';
import { BookingService } from '../../core/services/booking.service';
import { TripRowComponent } from './trip-row.component';

type TripFilter = 'upcoming' | 'completed' | 'cancelled' | 'all';

@Component({
  selector: 'at-my-trips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TripRowComponent, RouterLink],
  template: `
    <div class="head">
      <h2>My trips</h2>
      <div class="seg" role="tablist">
        @for (f of filters; track f.key) {
          <button type="button" role="tab" [class.on]="filter() === f.key" (click)="filter.set(f.key)">{{ f.label }} <span class="n">{{ count(f.key) }}</span></button>
        }
      </div>
    </div>
    @if (bookings() === undefined) {
      @for (i of [1, 2, 3]; track i) { <div class="skeleton" style="height: 88px; margin-bottom: .6rem"></div> }
    } @else {
      <div class="list">
        @for (b of visible(); track b.id) { <at-trip-row [b]="b" /> }
        @empty {
          <div class="card empty">
            <h3>{{ filter() === 'upcoming' ? 'No upcoming trips' : 'Nothing here yet' }}</h3>
            <p>Bookings you make will show up here with their e-tickets.</p>
            <a routerLink="/flights" class="btn btn-primary">Search flights</a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    h2 { font-size: 1.5rem; }
    .n { font-size: .74rem; color: var(--faint); margin-left: .2rem; }
    .list { display: grid; gap: .6rem; }
  `],
})
export class MyTripsComponent {
  protected readonly bookings = toSignal(inject(BookingService).mine().pipe(catchError(() => of([] as Booking[]))));
  protected readonly filter = signal<TripFilter>('upcoming');
  protected readonly filters: { key: TripFilter; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'all', label: 'All' },
  ];

  protected readonly visible = computed(() => this.apply(this.filter()));

  count(key: TripFilter): number {
    return this.apply(key).length;
  }

  private apply(key: TripFilter): Booking[] {
    const list = this.bookings() ?? [];
    switch (key) {
      case 'upcoming': return list.filter((b) => b.isUpcoming).sort((a, b) => a.segments[0].departure.localeCompare(b.segments[0].departure));
      case 'completed': return list.filter((b) => b.status === 'Confirmed' && !b.isUpcoming);
      case 'cancelled': return list.filter((b) => b.status === 'Cancelled' || b.status === 'Expired');
      default: return list;
    }
  }
}
