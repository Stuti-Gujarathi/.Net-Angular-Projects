import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'at-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="container nf">
      <p class="code display">404</p>
      <h1>This gate doesn't exist.</h1>
      <p class="muted">The page you're looking for has moved or never boarded.</p>
      <a routerLink="/" class="btn btn-dark btn-lg">Back to search</a>
    </section>
  `,
  styles: [`
    .nf { min-height: 60vh; display: grid; place-content: center; text-align: center; gap: 1rem; padding: 4rem 0; }
    .code { font-size: clamp(6rem, 18vw, 11rem); font-weight: 800; line-height: .8; letter-spacing: -.06em;
      background: linear-gradient(180deg, var(--ink), var(--line-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .btn { justify-self: center; margin-top: .5rem; }
  `],
})
export class NotFoundComponent {}
