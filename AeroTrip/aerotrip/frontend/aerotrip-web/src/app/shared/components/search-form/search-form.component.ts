import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CABIN_LABELS, CabinClass, SearchParams } from '../../../core/models/models';
import { CatalogService } from '../../../core/services/catalog.service';
import { AirportPickerComponent } from '../airport-picker/airport-picker.component';
import { IconComponent } from '../icon/icon.component';

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'at-search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AirportPickerComponent, IconComponent],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
})
export class SearchFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly airports = toSignal(inject(CatalogService).airports$, { initialValue: [] });

  /** Pre-fill when modifying an existing search. */
  readonly initial = input<Partial<SearchParams> | null>(null);
  readonly compact = input(false);

  protected readonly from = signal('DEL');
  protected readonly to = signal('BOM');
  protected readonly date = signal(isoDate(addDays(new Date(), 7)));
  protected readonly pax = signal(1);
  protected readonly cabin = signal<CabinClass>('Economy');
  protected readonly travellersOpen = signal(false);
  protected readonly submitted = signal(false);
  protected readonly swapped = signal(false);

  protected readonly today = isoDate(new Date());
  protected readonly maxDate = isoDate(addDays(new Date(), 330));
  protected readonly cabins: CabinClass[] = ['Economy', 'PremiumEconomy', 'Business'];
  protected readonly cabinLabels = CABIN_LABELS;

  ngOnInit(): void {
    const init = this.initial();
    if (!init) return;
    if (init.from) this.from.set(init.from);
    if (init.to) this.to.set(init.to);
    if (init.date && init.date >= this.today) this.date.set(init.date);
    if (init.pax) this.pax.set(init.pax);
    if (init.cabin) this.cabin.set(init.cabin);
  }

  swap(): void {
    const from = this.from();
    this.from.set(this.to());
    this.to.set(from);
    this.swapped.update((v) => !v);
  }

  changePax(delta: number): void {
    this.pax.update((p) => Math.min(9, Math.max(1, p + delta)));
  }

  search(): void {
    this.submitted.set(true);
    if (!this.from() || !this.to() || this.from() === this.to() || !this.date()) return;
    this.travellersOpen.set(false);
    this.router.navigate(['/flights'], {
      queryParams: { from: this.from(), to: this.to(), date: this.date(), pax: this.pax(), cabin: this.cabin() },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const pop = this.host.nativeElement.querySelector('.travellers');
    if (this.travellersOpen() && pop && !pop.contains(event.target as Node)) this.travellersOpen.set(false);
  }
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}
