import { Pipe, PipeTransform } from '@angular/core';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

/** Parses an ISO date (yyyy-mm-dd) as a local calendar date, avoiding UTC off-by-one. */
export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** ₹3,49,900 (Indian digit grouping). */
@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '' : inrFormatter.format(value);
  }
}

/** "6 Nov 2026", or "6 Nov" with the short style. */
@Pipe({ name: 'travelDate' })
export class TravelDatePipe implements PipeTransform {
  transform(value: string | null | undefined, style: 'long' | 'short' = 'long'): string {
    if (!value) return '';
    return (style === 'short' ? shortDateFormatter : dateFormatter).format(parseIsoDate(value));
  }
}

/** "9 days, 8 nights". */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(trip: { days: number; nights: number } | null | undefined): string {
    return trip ? `${trip.days} days, ${trip.nights} nights` : '';
  }
}
