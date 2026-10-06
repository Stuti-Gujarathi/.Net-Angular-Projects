import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Itinerary } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DayShiftPipe, DurationPipe, InrPipe, TimePipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'at-flight-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, InrPipe, DurationPipe, TimePipe, DayShiftPipe],
  templateUrl: './flight-card.component.html',
  styleUrl: './flight-card.component.scss',
})
export class FlightCardComponent {
  readonly itinerary = input.required<Itinerary>();
  readonly passengers = input(1);
  readonly expanded = input(false);
  readonly book = output<Itinerary>();
  readonly toggle = output<void>();

  protected readonly first = computed(() => this.itinerary().segments[0]);
  protected readonly last = computed(() => this.itinerary().segments[this.itinerary().segments.length - 1]);
  protected readonly airlines = computed(() => {
    const seen = new Map<string, { code: string; name: string; color: string }>();
    for (const s of this.itinerary().segments) seen.set(s.airlineCode, { code: s.airlineCode, name: s.airlineName, color: s.airlineColor });
    return [...seen.values()];
  });
  protected readonly flightNumbers = computed(() => this.itinerary().segments.map((s) => s.flightNumber.replace(/^([A-Z0-9]{2})/, '$1 ')).join(' + '));
  protected readonly stopsLabel = computed(() => {
    const it = this.itinerary();
    return it.stops === 0 ? 'Non-stop' : `1 stop via ${it.layovers[0].airportCode}`;
  });
  protected readonly highlightTags = computed(() => this.itinerary().tags.filter((t) => t === 'Cheapest' || t === 'Fastest' || t === 'Best value'));
}
