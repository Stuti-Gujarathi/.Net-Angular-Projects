import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model, signal, viewChild } from '@angular/core';

import { SceneTheme } from '../../core/models';
import { Scene } from '../scene/scene';

export interface WindowView {
  slug: string;
  theme: SceneTheme;
  label: string;
}

/**
 * The signature interaction: an aircraft window. Pull the shade up to look outside;
 * whatever matches your feeling is the view. Every view is pre-rendered and cross-faded
 * so changing a dial feels like the landscape drifting past, not a page reloading.
 */
@Component({
  selector: 'sgt-window-seat',
  imports: [Scene, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './window-seat.html',
  styleUrl: './window-seat.scss',
})
export class WindowSeat {
  readonly views = input.required<WindowView[]>();
  readonly active = input<string | null>(null);
  /** Two-way bindable: [(open)]. */
  readonly open = model(false);

  /** 0 (closed) to 1 (open) while the shade is being dragged; null otherwise. */
  protected readonly drag = signal<number | null>(null);
  protected readonly openness = computed(() => this.drag() ?? (this.open() ? 1 : 0));

  protected readonly activeView = computed<WindowView | null>(() => {
    const views = this.views();
    return views.find((v) => v.slug === this.active()) ?? views[0] ?? null;
  });

  protected readonly description = computed(() => {
    if (this.openness() < 0.2) return 'The window shade is down.';
    return this.activeView()?.label ?? 'Clouds outside the window.';
  });

  private readonly pane = viewChild.required<ElementRef<HTMLElement>>('pane');
  private startY = 0;
  private startOpen = 0;
  private moved = false;

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.startY = event.clientY;
    this.startOpen = this.openness();
    this.moved = false;
    this.drag.set(this.startOpen);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.drag() === null) return;
    const height = this.pane().nativeElement.clientHeight || 1;
    const delta = this.startY - event.clientY;
    if (Math.abs(delta) > 4) this.moved = true;
    this.drag.set(Math.min(1, Math.max(0, this.startOpen + delta / height)));
  }

  protected onPointerUp(): void {
    const fraction = this.drag();
    if (fraction === null) return;
    this.drag.set(null);

    if (!this.moved) {
      this.open.set(!this.open());
      return;
    }
    // A small, deliberate pull is enough to open; closing needs a clear push down.
    this.open.set(this.startOpen > 0.5 ? fraction > 0.7 : fraction > 0.18);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const actions: Record<string, () => void> = {
      ArrowUp: () => this.open.set(true),
      PageUp: () => this.open.set(true),
      End: () => this.open.set(true),
      ArrowDown: () => this.open.set(false),
      PageDown: () => this.open.set(false),
      Home: () => this.open.set(false),
      Enter: () => this.open.set(!this.open()),
      ' ': () => this.open.set(!this.open()),
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }
}
