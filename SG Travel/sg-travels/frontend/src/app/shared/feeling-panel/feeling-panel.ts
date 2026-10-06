import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { FeelingStore } from '../../core/feeling-store';
import { FALLBACK_AXES, PRESETS, dialValueText } from '../../core/feeling-words';
import { JourneyApi } from '../../core/journey-api';
import { FeelingAxis, FeelingKey } from '../../core/models';

let nextId = 0;

/** The three feeling dials. Reads and writes the shared FeelingStore. */
@Component({
  selector: 'sgt-feeling-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feeling-panel.html',
  styleUrl: './feeling-panel.scss',
})
export class FeelingPanel {
  readonly compact = input(false);
  readonly showPresets = input(true);

  protected readonly store = inject(FeelingStore);
  protected readonly presets = PRESETS;
  protected readonly uid = `dial${nextId++}`;

  protected readonly axes = toSignal(
    inject(JourneyApi).feelingAxes().pipe(catchError(() => of(FALLBACK_AXES))),
    { initialValue: FALLBACK_AXES },
  );

  protected value(key: FeelingKey): number {
    return this.store.feeling()[key];
  }

  protected valueText(axis: FeelingAxis): string {
    return dialValueText(axis, this.value(axis.key));
  }

  protected onInput(key: FeelingKey, event: Event): void {
    this.store.set(key, Number((event.target as HTMLInputElement).value));
  }
}
