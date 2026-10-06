import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'sgt-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap">
      <h1>This page has left the gate.</h1>
      <p class="lede">The link may be old or mistyped. Start from the window and we'll find you a trip.</p>
      <a class="btn btn--primary" routerLink="/">Find a trip by feeling</a>
    </section>
  `,
  styles: `
    section {
      display: grid;
      gap: 1.4rem;
      justify-items: start;
      padding-block: clamp(3rem, 10vw, 7rem);
    }

    h1 {
      font-size: var(--step-5);
    }
  `,
})
export class NotFoundPage {}
