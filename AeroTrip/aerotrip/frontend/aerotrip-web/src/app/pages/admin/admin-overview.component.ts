import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminStats, BookingStatus, STATUS_LABELS } from '../../core/models/models';
import { AdminService } from '../../core/services/admin.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InrPipe } from '../../shared/pipes/format.pipes';

const STATUS_COLORS: Record<BookingStatus, string> = {
  Confirmed: 'var(--mint)',
  PendingPayment: 'var(--amber)',
  Cancelled: 'var(--rose)',
  Expired: 'var(--line-2)',
};

@Component({
  selector: 'at-admin-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, IconComponent, InrPipe],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.scss',
})
export class AdminOverviewComponent {
  private readonly admin = inject(AdminService);
  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly hover = signal<number | null>(null);
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusColors = STATUS_COLORS;

  // Chart geometry (SVG viewBox units)
  protected readonly W = 700;
  protected readonly H = 220;
  protected readonly PAD = 28;

  protected readonly chart = computed(() => {
    const s = this.stats();
    if (!s) return null;
    const pts = s.revenueByDay;
    const max = Math.max(1, ...pts.map((p) => p.revenue));
    const niceMax = Math.ceil(max / 50_000) * 50_000;
    const slot = (this.W - this.PAD) / pts.length;
    const barW = slot * 0.58;
    const bars = pts.map((p, i) => {
      const h = (p.revenue / niceMax) * (this.H - this.PAD);
      return { ...p, x: this.PAD + i * slot + (slot - barW) / 2, y: this.H - this.PAD - h + 4, w: barW, h, cx: this.PAD + i * slot + slot / 2 };
    });
    const ticks = [0, 0.5, 1].map((f) => ({ y: this.H - this.PAD - f * (this.H - this.PAD) + 4, label: compact(niceMax * f) }));
    return { bars, ticks };
  });

  /** Booking status donut as a conic-gradient. */
  protected readonly donut = computed(() => {
    const s = this.stats();
    if (!s) return '';
    const total = s.statusBreakdown.reduce((n, x) => n + x.count, 0) || 1;
    let acc = 0;
    return 'conic-gradient(' + s.statusBreakdown.map((x) => {
      const from = (acc / total) * 100;
      acc += x.count;
      return `${STATUS_COLORS[x.status]} ${from}% ${(acc / total) * 100}%`;
    }).join(', ') + ')';
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.admin.stats().subscribe((s) => this.stats.set(s));
  }

  maxRouteRevenue(): number {
    return Math.max(1, ...(this.stats()?.topRoutes.map((r) => r.revenue) ?? [1]));
  }
}

function compact(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(n % 100_000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
  return `₹${n}`;
}
