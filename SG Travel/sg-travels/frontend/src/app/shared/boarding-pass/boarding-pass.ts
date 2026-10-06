import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DurationPipe, InrPipe, TravelDatePipe } from '../../core/format';
import { DiscoveryMatch } from '../../core/models';

/** A discovery result, printed as a boarding pass: origin, destination, why, how long, how much. */
@Component({
  selector: 'sgt-boarding-pass',
  imports: [RouterLink, InrPipe, TravelDatePipe, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boarding-pass.html',
  styleUrl: './boarding-pass.scss',
  host: {
    '[class.is-active]': 'active()',
    '[style.--accent]': 'match().journey.theme.accent',
  },
})
export class BoardingPass {
  readonly match = input.required<DiscoveryMatch>();
  readonly rank = input(1);
  readonly active = input(false);
}
