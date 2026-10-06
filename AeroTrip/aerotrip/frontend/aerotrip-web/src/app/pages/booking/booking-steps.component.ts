import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';

/** Progress through the booking flow. Numbered because it genuinely is a sequence. */
@Component({
  selector: 'at-booking-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <ol class="steps">
      @for (s of steps; track s; let i = $index) {
        <li [class.done]="i + 1 < current()" [class.on]="i + 1 === current()">
          <span class="dot">@if (i + 1 < current()) { <at-icon name="check" [size]="14" [stroke]="3" /> } @else { {{ i + 1 }} }</span>
          <span class="txt">{{ s }}</span>
        </li>
      }
    </ol>
  `,
  styles: [`
    .steps { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    li { display: flex; align-items: center; gap: .55rem; color: var(--faint); font-weight: 600; font-size: .88rem; }
    li + li::before { content: ''; width: 36px; height: 2px; background: var(--line-2); margin-right: .2rem; }
    .dot { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; border: 2px solid var(--line-2); font-size: .8rem; background: var(--surface); }
    .on { color: var(--ink); } .on .dot { border-color: var(--coral); background: var(--coral); color: #fff; }
    .done { color: var(--ink-3); } .done .dot { border-color: var(--ink); background: var(--ink); color: #fff; }
    .done + li::before, .on + li::before { background: var(--line-2); }
    li.done + li::before { background: var(--ink); }
    @media (max-width: 560px) { .txt { display: none; } li.on .txt { display: inline; } }
  `],
})
export class BookingStepsComponent {
  readonly current = input(1);
  protected readonly steps = ['Review and travellers', 'Payment', 'Ticket'];
}
