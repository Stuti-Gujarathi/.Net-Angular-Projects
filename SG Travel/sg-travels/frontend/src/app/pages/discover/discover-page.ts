import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { FeelingStore } from '../../core/feeling-store';
import { JourneyApi } from '../../core/journey-api';
import { liveMatches } from '../../core/live-matches';
import { Feeling } from '../../core/models';
import { Mood } from '../../core/mood';
import { BoardingPass } from '../../shared/boarding-pass/boarding-pass';
import { FeelingPanel } from '../../shared/feeling-panel/feeling-panel';
import { FlightInfo } from '../../shared/window-seat/flight-info';
import { WindowSeat, WindowView } from '../../shared/window-seat/window-seat';

/** 3–5 journeys for the current feeling. Pointing at a pass puts that place in the window. */
@Component({
  selector: 'sgt-discover-page',
  imports: [RouterLink, WindowSeat, FlightInfo, FeelingPanel, BoardingPass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './discover-page.html',
  styleUrl: './discover-page.scss',
})
export class DiscoverPage {
  private readonly api = inject(JourneyApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly mood = inject(Mood);
  protected readonly store = inject(FeelingStore);

  protected readonly live = liveMatches(4, (feeling) => this.syncUrl(feeling));
  protected readonly shadeOpen = signal(true);
  protected readonly focused = signal<string | null>(null);

  protected readonly views = toSignal(
    this.api.journeys().pipe(
      map((list): WindowView[] => list.map((j) => ({ slug: j.slug, theme: j.theme, label: `The view over ${j.destination}: ${j.tagline}` }))),
      catchError(() => of<WindowView[]>([])),
    ),
    { initialValue: [] },
  );

  protected readonly activeSlug = computed(() => this.focused() ?? this.live.matches()[0]?.journey.slug ?? null);
  protected readonly activeMatch = computed(
    () => this.live.matches().find((m) => m.journey.slug === this.activeSlug()) ?? null,
  );

  protected readonly countText = computed(() => {
    const n = this.live.matches().length;
    return n ? `${n} trips fit, best match first. Point at one to see it from your window.` : '';
  });

  constructor() {
    // A shared or bookmarked link carries its feeling in the URL.
    const fromUrl = FeelingStore.fromQueryParams(this.route.snapshot.queryParamMap);
    if (fromUrl) {
      this.store.setAll(fromUrl);
    }

    effect(() => this.mood.set(this.activeMatch()?.journey.theme.accent));
  }

  /** Keeps the URL shareable without triggering a router navigation per dial move. */
  private syncUrl(feeling: Feeling): void {
    const url = this.router.createUrlTree([], { relativeTo: this.route, queryParams: feeling }).toString();
    this.location.replaceState(url);
  }
}
