import { inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, map, merge, of, switchMap, tap } from 'rxjs';

import { FeelingStore } from './feeling-store';
import { JourneyApi } from './journey-api';
import { DiscoveryMatch, Feeling } from './models';

/**
 * Re-ranks journeys whenever the feeling changes. Debounced so dragging a dial
 * doesn't fire a request per pixel, and switchMap drops stale responses.
 * Must be called from an injection context (a field initialiser or constructor).
 */
export function liveMatches(take: number, onFeeling?: (feeling: Feeling) => void) {
  const api = inject(JourneyApi);
  const store = inject(FeelingStore);

  const matches = signal<DiscoveryMatch[]>([]);
  const loading = signal(true);
  const failed = signal(false);
  const retry$ = new Subject<void>();

  merge(
    toObservable(store.feeling).pipe(debounceTime(140)),
    retry$.pipe(map(() => store.feeling())),
  )
    .pipe(
      tap((feeling) => {
        loading.set(true);
        onFeeling?.(feeling);
      }),
      switchMap((feeling) =>
        api.discover(feeling, take).pipe(
          map((response) => ({ ok: true as const, response })),
          catchError((error: unknown) => {
            console.error('Discovery request failed', error);
            return of({ ok: false as const });
          }),
        ),
      ),
      takeUntilDestroyed(),
    )
    .subscribe((result) => {
      loading.set(false);
      failed.set(!result.ok);
      if (result.ok) {
        matches.set(result.response.matches);
      }
    });

  return {
    matches: matches.asReadonly(),
    loading: loading.asReadonly(),
    failed: failed.asReadonly(),
    retry: () => retry$.next(),
  };
}
