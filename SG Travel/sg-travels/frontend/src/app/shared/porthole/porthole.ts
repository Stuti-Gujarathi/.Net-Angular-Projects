import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SceneTheme } from '../../core/models';
import { Scene } from '../scene/scene';

/** A tiny static window, used as a thumbnail wherever a trip is listed. */
@Component({
  selector: 'sgt-porthole',
  imports: [Scene],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="rim"><sgt-scene [theme]="theme()" [animate]="false" /></div>`,
  styles: `
    :host {
      display: block;
      width: var(--size, 3.25rem);
      flex: none;
    }

    .rim {
      position: relative;
      aspect-ratio: 0.72;
      overflow: hidden;
      border-radius: 46% / 33%;
      box-shadow: 0 0 0 3px #e3e5df, 0 0 0 4px var(--bezel-deep);

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }
  `,
})
export class Porthole {
  readonly theme = input.required<SceneTheme>();
}
