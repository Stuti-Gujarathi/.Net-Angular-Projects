import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/interceptors/error.interceptor';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

/** Demo accounts seeded by the API (see README). */
const DEMO_ACCOUNTS = [
  { role: 'Admin', name: 'AeroTrip Admin', email: 'admin@aerotrip.com', password: 'Admin@123' },
  { role: 'User', name: 'Riya Mehta', email: 'riya@aerotrip.com', password: 'User@123' },
  { role: 'User', name: 'Arjun Nair', email: 'arjun@aerotrip.com', password: 'User@123' },
];

@Component({
  selector: 'at-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './auth-shell.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly demos = DEMO_ACCOUNTS;
  protected readonly returnUrl = this.query.get('returnUrl');
  protected readonly fromBooking = !!this.returnUrl?.startsWith('/booking');
  protected readonly expired = this.query.get('expired') === '1';

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  useDemo(d: (typeof DEMO_ACCOUNTS)[number]): void {
    this.form.setValue({ email: d.email, password: d.password });
    this.error.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.toast.success(`Welcome back, ${res.user.fullName.split(' ')[0]}.`);
        this.router.navigateByUrl(this.returnUrl || this.auth.homeRoute());
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err));
        this.busy.set(false);
      },
    });
  }
}
