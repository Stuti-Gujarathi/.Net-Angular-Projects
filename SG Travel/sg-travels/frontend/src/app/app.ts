import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Mood } from './core/mood';

@Component({
  selector: 'sgt-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--mood]': 'mood.accent()' },
  template: `
    <a class="skip" href="#main">Skip to content</a>

    <header class="site-header wrap">
      <a class="wordmark" routerLink="/" aria-label="SG Travels home">SG Travels</a>
      <nav aria-label="Main">
        <ul>
          <li>
            <a routerLink="/" routerLinkActive="is-current" [routerLinkActiveOptions]="{ exact: true }">Find by feeling</a>
          </li>
          <li><a routerLink="/discover" routerLinkActive="is-current">Your matches</a></li>
          <li><a routerLink="/" fragment="departing">Departing soon</a></li>
        </ul>
      </nav>
    </header>

    <main id="main" tabindex="-1">
      <router-outlet />
    </main>

    <footer class="site-footer">
      <div class="wrap footer-inner">
        <p class="wordmark wordmark--small">SG Travels</p>
        <p>
          Escorted holidays from India with an Indian Tour Manager on every departure.
          Prices are indicative, per person on twin sharing; GST and TCS extra.
        </p>
        <p class="footer-note">Concept build for the SG Travels UI/UX assignment.</p>
      </div>
    </footer>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      transition: --mood 900ms var(--ease-out);
    }

    .skip {
      position: absolute;
      left: 1rem;
      top: -4rem;
      z-index: 10;
      padding: 0.6rem 1rem;
      background: var(--ink);
      color: #fff;
      border-radius: 8px;

      &:focus {
        top: 1rem;
      }
    }

    .site-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      min-height: 4.75rem;
    }

    .wordmark {
      white-space: nowrap;
      font-family: var(--font-display);
      font-size: 1.65rem;
      line-height: 1;
      text-decoration: none;
      color: var(--ink);
    }

    .wordmark--small {
      font-size: 1.3rem;
    }

    nav ul {
      display: flex;
      gap: clamp(0.9rem, 2.2vw, 2rem);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    nav a {
      white-space: nowrap;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--ink-soft);
      text-decoration: none;
      padding-block: 0.4rem;
      border-bottom: 2px solid transparent;
      transition: color 160ms ease, border-color 160ms ease;

      &:hover,
      &.is-current {
        color: var(--ink);
        border-bottom-color: var(--mood);
      }
    }

    main {
      flex: 1;
      outline: none;
    }

    .site-footer {
      margin-top: clamp(4rem, 8vw, 7rem);
      border-top: 1px solid var(--bezel);
      background: var(--panel);
    }

    .footer-inner {
      display: grid;
      grid-template-columns: auto minmax(0, 46ch) 1fr;
      gap: 1rem 3rem;
      align-items: baseline;
      padding-block: 2.5rem;
      font-size: 0.9rem;
      color: var(--ink-soft);
    }

    .footer-note {
      justify-self: end;
      color: var(--ink-faint);
    }

    @media (max-width: 760px) {
      nav li:last-child {
        display: none;
      }

      .wordmark {
        font-size: 1.35rem;
      }

      nav a {
        font-size: 0.85rem;
      }

      .footer-inner {
        grid-template-columns: 1fr;
      }

      .footer-note {
        justify-self: start;
      }
    }
  `,
})
export class App {
  protected readonly mood = inject(Mood);
}
