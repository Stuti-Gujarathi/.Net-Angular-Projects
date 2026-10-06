import { Injectable, signal } from '@angular/core';

export const DEFAULT_MOOD = '#2F4A6D';

/** The accent colour the whole interface borrows from whatever is "outside the window". */
@Injectable({ providedIn: 'root' })
export class Mood {
  readonly accent = signal(DEFAULT_MOOD);

  set(color: string | null | undefined): void {
    this.accent.set(color && /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_MOOD);
  }

  reset(): void {
    this.accent.set(DEFAULT_MOOD);
  }
}
