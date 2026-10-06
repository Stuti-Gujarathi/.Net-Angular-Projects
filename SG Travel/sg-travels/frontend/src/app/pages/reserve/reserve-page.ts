import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { DurationPipe, InrPipe, TravelDatePipe } from '../../core/format';
import { JourneyApi } from '../../core/journey-api';
import { EnquiryConfirmation, JourneyDetail, ProblemDetails } from '../../core/models';
import { Mood } from '../../core/mood';

type LoadState = { status: 'loading' } | { status: 'ready'; journey: JourneyDetail } | { status: 'missing' } | { status: 'error' };

type FieldName = 'fullName' | 'email' | 'phone' | 'travellers' | 'departure' | 'note';

const MESSAGES: Record<FieldName, Record<string, string>> = {
  fullName: { required: 'Enter your full name.', minlength: 'Enter your full name.', maxlength: 'Keep your name under 80 characters.' },
  email: { required: 'Enter your email so we can send the itinerary.', email: 'Enter an email like name@example.com.' },
  phone: { required: 'Enter a phone number so a travel designer can call you.', pattern: 'Enter a phone number with 7 to 15 digits.' },
  travellers: { required: 'Enter how many people are travelling.', min: 'At least 1 traveller.', max: 'For groups over 20, call us and we will plan a private departure.' },
  departure: {},
  note: { maxlength: 'Keep the note under 500 characters.' },
};

@Component({
  selector: 'sgt-reserve-page',
  imports: [RouterLink, ReactiveFormsModule, InrPipe, TravelDatePipe, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reserve-page.html',
  styleUrl: './reserve-page.scss',
})
export class ReservePage {
  readonly slug = input.required<string>();
  /** Optional ?departure=yyyy-mm-dd from the journey page's date chips. */
  readonly departure = input<string | undefined>(undefined);

  private readonly api = inject(JourneyApi);
  private readonly title = inject(Title);
  private readonly mood = inject(Mood);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        this.api.journey(slug).pipe(
          map((journey): LoadState => ({ status: 'ready', journey })),
          catchError((err: HttpErrorResponse) => of<LoadState>({ status: err.status === 404 ? 'missing' : 'error' })),
          startWith<LoadState>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState },
  );

  protected readonly journey = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.journey : null;
  });

  protected readonly form = inject(NonNullableFormBuilder).group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9][0-9 -]{6,16}$/)]],
    travellers: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
    departure: [''],
    note: ['', [Validators.maxLength(500)]],
  });

  /** Live form values, for the boarding-pass preview. */
  protected readonly values = toSignal(
    this.form.valueChanges.pipe(
      map(() => this.form.getRawValue()),
      startWith(this.form.getRawValue()),
    ),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly confirmation = signal<EnquiryConfirmation | null>(null);

  constructor() {
    effect(() => {
      const j = this.journey();
      if (!j) return;
      this.title.setTitle(`Reserve a seat on ${j.title} | SG Travels`);
      this.mood.set(j.theme.accent);

      const wanted = this.departure();
      if (wanted && j.departures.includes(wanted) && !this.form.controls.departure.value) {
        this.form.controls.departure.setValue(wanted);
      }
    });
  }

  protected errorFor(name: FieldName): string | null {
    const control = this.form.controls[name];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    if (control.errors['server']) return control.errors['server'] as string;
    const key = Object.keys(control.errors)[0];
    return MESSAGES[name][key] ?? 'Check this field.';
  }

  protected submit(): void {
    const journey = this.journey();
    if (!journey || this.submitting()) return;

    this.submitted.set(true);
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    const v = this.form.getRawValue();
    this.submitting.set(true);

    this.api
      .reserve({
        journeySlug: journey.slug,
        fullName: v.fullName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        travellers: Number(v.travellers),
        departure: v.departure || null,
        note: v.note.trim() || null,
      })
      .subscribe({
        next: (confirmation) => {
          this.submitting.set(false);
          this.confirmation.set(confirmation);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.handleError(err);
        },
      });
  }

  private handleError(err: HttpErrorResponse): void {
    const problem = (err.error ?? {}) as ProblemDetails;

    if (err.status === 400 && problem.errors) {
      let mapped = false;
      for (const [key, messages] of Object.entries(problem.errors)) {
        const name = (key.charAt(0).toLowerCase() + key.slice(1)) as FieldName;
        const control = this.form.controls[name];
        if (control && messages.length) {
          control.setErrors({ server: messages[0] });
          mapped = true;
        }
      }
      if (!mapped) this.submitError.set('Some details need another look. Check the form and try again.');
      return;
    }

    if (err.status === 429) {
      this.submitError.set('Too many requests from this device. Wait a minute, then try again.');
    } else if (err.status === 404) {
      this.submitError.set('This journey is no longer on sale. Go back and choose another trip.');
    } else {
      this.submitError.set("Your request didn't send. Check your connection and try again.");
    }
  }
}
