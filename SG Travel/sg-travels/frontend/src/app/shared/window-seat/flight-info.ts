import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DiscoveryMatch } from '../../core/models';

/** The little in-flight readout under the window: what you're looking at and how well it fits. */
@Component({
  selector: 'sgt-flight-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (failed()) {
      <p class="status">The view isn't loading. Check your connection; we'll keep trying as you move the dials.</p>
    } @else if (match(); as m) {
      <div class="row">
        <span class="swatch" [style.background]="m.journey.theme.accent" aria-hidden="true"></span>
        <p class="place" aria-live="polite">{{ m.journey.destination }}</p>
        <p class="score"><strong>{{ m.score }}%</strong> match</p>
      </div>
      <p class="reason">{{ m.reason }}</p>
    } @else {
      <p class="status">Looking for the right view…</p>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 0.9rem 1.1rem;
      border-radius: var(--radius-pass);
      background: var(--panel);
      border: 1px solid var(--bezel);
    }

    .row {
      display: flex;
      align-items: baseline;
      gap: 0.6rem;
    }

    .swatch {
      flex: none;
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 50%;
      align-self: center;
      transition: background-color 600ms ease;
    }

    .place {
      flex: 1;
      font-family: var(--font-display);
      font-size: var(--step-2);
      line-height: 1.1;
    }

    .score {
      font-size: 0.9rem;
      color: var(--ink-soft);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;

      strong {
        color: var(--ink);
        font-weight: 700;
      }
    }

    .reason,
    .status {
      margin-top: 0.25rem;
      font-size: 0.92rem;
      color: var(--ink-soft);
    }
  `,
})
export class FlightInfo {
  readonly match = input<DiscoveryMatch | null>(null);
  readonly failed = input(false);
}
