import { Injectable, computed, signal } from '@angular/core';
import { ParamMap, Params } from '@angular/router';

import { DEFAULT_FEELING, FEELING_KEYS, clampFeeling, describeFeeling } from './feeling-words';
import { Feeling, FeelingKey } from './models';

/** The traveller's current feeling. Shared by every page so it survives navigation. */
@Injectable({ providedIn: 'root' })
export class FeelingStore {
  private readonly state = signal<Feeling>(DEFAULT_FEELING, {
    equal: (a, b) => FEELING_KEYS.every((k) => a[k] === b[k]),
  });

  readonly feeling = this.state.asReadonly();
  readonly sentence = computed(() => describeFeeling(this.state()));

  /** Becomes true the first time someone moves a dial; the window opens itself then. */
  readonly touched = signal(false);

  set(key: FeelingKey, value: number): void {
    this.state.update((f) => ({ ...f, [key]: clampFeeling(value) }));
    this.touched.set(true);
  }

  setAll(feeling: Feeling): void {
    this.state.set({
      zenWild: clampFeeling(feeling.zenWild),
      romanticAdventurous: clampFeeling(feeling.romanticAdventurous),
      luxuryRaw: clampFeeling(feeling.luxuryRaw),
    });
    this.touched.set(true);
  }

  toQueryParams(feeling: Feeling = this.state()): Params {
    return { ...feeling };
  }

  /** Reads ?zenWild=..&romanticAdventurous=..&luxuryRaw=.. Returns null if any is missing. */
  static fromQueryParams(params: ParamMap): Feeling | null {
    if (FEELING_KEYS.some((k) => !params.has(k))) {
      return null;
    }
    const values = FEELING_KEYS.map((k) => Number(params.get(k)));
    if (values.some((v) => !Number.isFinite(v))) {
      return null;
    }
    const [zenWild, romanticAdventurous, luxuryRaw] = values.map(clampFeeling);
    return { zenWild, romanticAdventurous, luxuryRaw };
  }
}
