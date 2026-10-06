import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, input, model, signal, viewChild } from '@angular/core';
import { Airport } from '../../../core/models/models';

/** Accessible combobox: type a city, code or country; arrow keys + Enter to choose. */
@Component({
  selector: 'at-airport-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-picker.component.html',
  styleUrl: './airport-picker.component.scss',
})
export class AirportPickerComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly label = input.required<string>();
  readonly airports = input<Airport[]>([]);
  readonly exclude = input<string | null>(null);
  readonly invalid = input(false);
  readonly value = model<string>('');

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly active = signal(0);
  private readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('searchBox');

  protected readonly selected = computed(() => this.airports().find((a) => a.code === this.value()) ?? null);
  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.airports().filter((a) => a.code !== this.exclude());
    if (!q) return list;
    return list
      .filter((a) => a.code.toLowerCase().startsWith(q) || a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.country.toLowerCase().includes(q))
      .sort((a, b) => Number(!a.code.toLowerCase().startsWith(q)) - Number(!b.code.toLowerCase().startsWith(q)));
  });

  toggle(): void {
    if (this.open()) {
      this.open.set(false);
      return;
    }
    this.query.set('');
    this.active.set(0);
    this.open.set(true);
    setTimeout(() => this.searchBox()?.nativeElement.focus());
  }

  choose(airport: Airport): void {
    this.value.set(airport.code);
    this.open.set(false);
  }

  onQuery(value: string): void {
    this.query.set(value);
    this.active.set(0);
  }

  onKey(event: KeyboardEvent): void {
    const count = this.results().length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active.update((i) => Math.min(count - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const pick = this.results()[this.active()];
      if (pick) this.choose(pick);
    } else if (event.key === 'Escape') {
      this.open.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
