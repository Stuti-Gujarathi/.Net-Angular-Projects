import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Offer, PopularRoute } from '../../core/models/models';
import { CatalogService } from '../../core/services/catalog.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SearchFormComponent } from '../../shared/components/search-form/search-form.component';
import { DurationPipe, InrPipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'at-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchFormComponent, IconComponent, InrPipe, DurationPipe, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly routes = toSignal(this.catalog.popularRoutes().pipe(catchError(() => of(null))), { initialValue: undefined });
  protected readonly offers = toSignal(this.catalog.offers().pipe(catchError(() => of([] as Offer[]))), { initialValue: [] as Offer[] });
  protected readonly copied = signal<string | null>(null);

  searchRoute(r: PopularRoute): void {
    this.router.navigate(['/flights'], { queryParams: { from: r.from, to: r.to, date: r.lowestFareDate, pax: 1, cabin: 'Economy' } });
  }

  async copy(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard can be blocked on http; the code is still visible */
    }
    this.copied.set(code);
    this.toast.success(`${code} copied. Paste it at checkout.`);
    setTimeout(() => this.copied.set(null), 2000);
  }

  headline(o: Offer): string {
    return o.discountType === 'Flat' ? `₹${o.value.toLocaleString('en-IN')}` : `${o.value}%`;
  }
}
