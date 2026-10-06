import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { FeelingStore } from '../../core/feeling-store';
import { DurationPipe, InrPipe, TravelDatePipe } from '../../core/format';
import { JourneyApi } from '../../core/journey-api';
import { JourneyDetail } from '../../core/models';
import { Mood } from '../../core/mood';
import { Scene } from '../../shared/scene/scene';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; journey: JourneyDetail }
  | { status: 'missing' }
  | { status: 'error' };

@Component({
  selector: 'sgt-journey-page',
  imports: [RouterLink, Scene, InrPipe, TravelDatePipe, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './journey-page.html',
  styleUrl: './journey-page.scss',
  host: { '(window:resize)': 'layoutTick.update((n) => n + 1)' },
})
export class JourneyPage {
  /** Bound from the :slug route parameter. */
  readonly slug = input.required<string>();

  private readonly api = inject(JourneyApi);
  private readonly title = inject(Title);
  private readonly mood = inject(Mood);
  protected readonly store = inject(FeelingStore);

  private readonly retry = signal(0);

  protected readonly state = toSignal(
    toObservable(computed(() => ({ slug: this.slug(), attempt: this.retry() }))).pipe(
      switchMap(({ slug }) =>
        this.api.journey(slug).pipe(
          map((journey): LoadState => ({ status: 'ready', journey })),
          catchError((err: HttpErrorResponse) => of<LoadState>({ status: err.status === 404 ? 'missing' : 'error' })),
          startWith<LoadState>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState },
  );

  protected readonly journey = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.journey : null;
  });

  // ---- Itinerary "flight path": a plane follows the day you're reading ----
  protected readonly activeDay = signal(1);
  protected readonly planeTop = signal(0);
  protected readonly layoutTick = signal(0);
  private readonly dayEls = viewChildren<ElementRef<HTMLElement>>('dayEl');

  constructor() {
    effect(() => {
      const j = this.journey();
      if (j) {
        this.title.setTitle(`${j.title}: ${j.days} days | SG Travels`);
        this.mood.set(j.theme.accent);
      }
    });

    // Watch which day is in the reading zone (just above the middle of the viewport).
    effect((onCleanup) => {
      const els = this.dayEls();
      if (!els.length || typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.activeDay.set(Number((entry.target as HTMLElement).dataset['day']));
            }
          }
        },
        { rootMargin: '-35% 0px -55% 0px' },
      );
      els.forEach((el) => observer.observe(el.nativeElement));
      onCleanup(() => observer.disconnect());
    });

    // Move the plane to the active day's stop.
    effect(() => {
      this.layoutTick();
      const day = this.activeDay();
      const el = this.dayEls().find((e) => Number(e.nativeElement.dataset['day']) === day);
      if (el) this.planeTop.set(el.nativeElement.offsetTop + 1);
    });
  }

  protected reload(): void {
    this.retry.update((n) => n + 1);
  }

  protected goToDay(day: number, event: Event): void {
    event.preventDefault();
    this.activeDay.set(day);
    const el = this.dayEls().find((e) => Number(e.nativeElement.dataset['day']) === day)?.nativeElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
