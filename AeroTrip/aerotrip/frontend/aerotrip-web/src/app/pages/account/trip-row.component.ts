import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Booking, CABIN_LABELS, STATUS_LABELS } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InrPipe, TimePipe } from '../../shared/pipes/format.pipes';

/** One booking as a compact ticket row. */
@Component({
  selector: 'at-trip-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, IconComponent, InrPipe, TimePipe],
  template: `
    <a class="row" [routerLink]="['/trips', b().id]" [class.dim]="b().status === 'Cancelled' || b().status === 'Expired'">
      <div class="date"><b>{{ b().segments[0].departure | date: 'd' }}</b><span>{{ b().segments[0].departure | date: 'MMM' }}</span></div>
      <div class="route">
        <div class="codes"><b>{{ b().segments[0].origin }}</b><at-icon name="arrow-right" [size]="16" /><b>{{ last().destination }}</b></div>
        <small>{{ b().segments[0].originCity }} to {{ last().destinationCity }}, {{ b().segments[0].departure | hhmm }}</small>
      </div>
      <div class="air">
        <span class="airline-mark" [style.background]="b().segments[0].airlineColor">{{ b().segments[0].airlineCode }}</span>
        <div><b>{{ b().segments[0].airlineName }}</b><small>{{ cabin() }}, {{ b().passengers.length }} {{ b().passengers.length === 1 ? 'traveller' : 'travellers' }}</small></div>
      </div>
      <div class="pnr"><small>PNR</small><b class="tnum">{{ b().pnr }}</b></div>
      <div class="amt"><b class="tnum">{{ b().fare.total | inr }}</b><span class="badge" [class]="'badge badge-' + b().status">{{ statusLabel() }}</span></div>
      <at-icon name="chevron-right" class="chev" />
    </a>
  `,
  styles: [`
    .row { display: grid; grid-template-columns: 56px minmax(170px, 1.3fr) minmax(170px, 1fr) 90px 130px 20px; gap: 1.2rem; align-items: center;
      padding: 1rem 1.2rem; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; color: inherit; text-decoration: none !important; transition: border-color .15s, box-shadow .15s; }
    .row:hover { border-color: var(--line-2); box-shadow: var(--shadow); }
    .dim { opacity: .7; }
    .date { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 14px; background: var(--paper); line-height: 1;
      b { font-family: var(--font-display); font-size: 1.4rem; } span { font-size: .72rem; font-weight: 700; color: var(--coral-ink); margin-top: .2rem; } }
    .route small, .air small, .pnr small { color: var(--muted); font-size: .78rem; }
    .codes { display: flex; align-items: center; gap: .5rem; b { font-family: var(--font-display); font-size: 1.3rem; letter-spacing: -.02em; } at-icon { color: var(--faint); } }
    .air { display: flex; gap: .6rem; align-items: center; div { display: grid; min-width: 0; } b { font-size: .88rem; } }
    .pnr { display: grid; b { font-family: var(--font-display); letter-spacing: .06em; } }
    .amt { display: grid; justify-items: end; gap: .3rem; b { font-family: var(--font-display); font-size: 1.1rem; } }
    .chev { color: var(--faint); }
    @media (max-width: 860px) { .row { grid-template-columns: 56px 1fr auto; } .air, .pnr, .chev { display: none; } }
  `],
})
export class TripRowComponent {
  readonly b = input.required<Booking>();
  protected readonly last = computed(() => this.b().segments[this.b().segments.length - 1]);
  protected readonly cabin = computed(() => CABIN_LABELS[this.b().cabin]);
  protected readonly statusLabel = computed(() =>
    this.b().status === 'Confirmed' && !this.b().isUpcoming ? 'Completed' : STATUS_LABELS[this.b().status]);
}
