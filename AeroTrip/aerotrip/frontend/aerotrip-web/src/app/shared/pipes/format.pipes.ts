import { Pipe, PipeTransform } from '@angular/core';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** ₹12,34,567 — Indian digit grouping, no paise. */
@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '—' : inr.format(Math.round(value));
  }
}

/** 135 → "2h 15m". */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    if (minutes == null) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
}

/** Number of calendar days between two local date-times (for the "+1" arrival marker). */
@Pipe({ name: 'dayShift' })
export class DayShiftPipe implements PipeTransform {
  transform(departure: string, arrival: string): number {
    const d = new Date(departure.slice(0, 10) + 'T00:00:00');
    const a = new Date(arrival.slice(0, 10) + 'T00:00:00');
    return Math.round((a.getTime() - d.getTime()) / 86_400_000);
  }
}

/** API date-times are local wall-clock strings ("2026-10-12T06:15:00"); slice rather than shift time zones. */
@Pipe({ name: 'hhmm' })
export class TimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? value.slice(11, 16) : '';
  }
}
