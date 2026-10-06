import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { Booking, BookingStatus, BookingSummary, CABIN_LABELS, PagedResult, STATUS_LABELS } from '../../core/models/models';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { DrawerComponent, ModalComponent } from '../../shared/components/drawer/drawer.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DurationPipe, InrPipe, TimePipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'at-admin-bookings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, IconComponent, InrPipe, DurationPipe, TimePipe, DrawerComponent, ModalComponent],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-shared.scss',
})
export class AdminBookingsComponent {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly cabinLabels = CABIN_LABELS;
  protected readonly statuses: (BookingStatus | null)[] = [null, 'Confirmed', 'PendingPayment', 'Cancelled', 'Expired'];

  protected readonly status = signal<BookingStatus | null>(null);
  protected readonly search = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 12;
  protected readonly result = signal<PagedResult<BookingSummary> | null>(null);
  protected readonly loading = signal(true);

  protected readonly selected = signal<Booking | null>(null);
  protected readonly drawerOpen = signal(false);
  protected readonly confirmOpen = signal(false);
  protected readonly cancelling = signal(false);
  private readonly reload = signal(0);

  constructor() {
    combineLatest([
      toObservable(this.status),
      toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.page),
      toObservable(this.reload),
    ])
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(([status, search, page]) => this.admin.bookings({ status, search, page, pageSize: this.pageSize })),
        takeUntilDestroyed(),
      )
      .subscribe((r) => {
        this.result.set(r);
        this.loading.set(false);
      });
  }

  setStatus(s: BookingStatus | null): void {
    this.status.set(s);
    this.page.set(1);
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  open(row: BookingSummary): void {
    this.selected.set(null);
    this.drawerOpen.set(true);
    this.admin.booking(row.id).subscribe((b) => this.selected.set(b));
  }

  cancel(): void {
    const b = this.selected();
    if (!b) return;
    this.cancelling.set(true);
    this.admin.cancelBooking(b.id).subscribe({
      next: (updated) => {
        this.selected.set(updated);
        this.cancelling.set(false);
        this.confirmOpen.set(false);
        this.reload.update((n) => n + 1);
        this.toast.success(`Booking ${updated.pnr} cancelled. Full refund of ₹${updated.refundAmount.toLocaleString('en-IN')} issued.`);
      },
      error: () => this.cancelling.set(false),
    });
  }
}
