import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'at-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe, IconComponent],
  template: `
    <div class="grid">
      <section class="card card-pad">
        <h2 class="card-title">Personal details</h2>
        <p class="muted small">Used to pre-fill the first traveller on every booking.</p>
        <form [formGroup]="profile" (ngSubmit)="saveProfile()" class="stack form" novalidate>
          <div class="field"><label for="pn">Full name</label><input id="pn" class="input" formControlName="fullName" /></div>
          <div class="field"><label for="pe">Email</label><input id="pe" class="input" [value]="auth.user()?.email" disabled /></div>
          <div class="field">
            <label for="pp">Mobile</label><input id="pp" class="input" inputmode="numeric" maxlength="10" formControlName="phone" />
            @if (profile.controls.phone.touched && profile.controls.phone.invalid) { <span class="field-error">Enter a 10-digit mobile number.</span> }
          </div>
          <div class="row"><button class="btn btn-dark" [disabled]="savingProfile() || profile.pristine">Save changes</button>
            <span class="muted small">Member since {{ auth.user()?.createdAt | date: 'MMMM y' }}</span></div>
        </form>
      </section>

      <section class="card card-pad">
        <h2 class="card-title">Password</h2>
        <p class="muted small">Use at least 8 characters.</p>
        <form [formGroup]="password" (ngSubmit)="savePassword()" class="stack form" novalidate>
          <div class="field"><label for="cp">Current password</label><input id="cp" class="input" type="password" formControlName="currentPassword" autocomplete="current-password" /></div>
          <div class="field">
            <label for="np">New password</label><input id="np" class="input" type="password" formControlName="newPassword" autocomplete="new-password" />
            @if (password.controls.newPassword.touched && password.controls.newPassword.invalid) { <span class="field-error">At least 8 characters.</span> }
          </div>
          <div><button class="btn btn-dark" [disabled]="savingPassword()"><at-icon name="lock" />Update password</button></div>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: start; }
    .small { font-size: .85rem; margin-top: .3rem; }
    .form { margin-top: 1.2rem; }
    @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);

  protected readonly profile = this.fb.nonNullable.group({
    fullName: [this.auth.user()?.fullName ?? '', [Validators.required, Validators.minLength(2)]],
    phone: [this.auth.user()?.phone ?? '', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
  });

  protected readonly password = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  saveProfile(): void {
    if (this.profile.invalid) { this.profile.markAllAsTouched(); return; }
    this.savingProfile.set(true);
    this.auth.updateProfile(this.profile.getRawValue()).subscribe({
      next: () => { this.savingProfile.set(false); this.profile.markAsPristine(); this.toast.success('Profile updated.'); },
      error: () => this.savingProfile.set(false),
    });
  }

  savePassword(): void {
    if (this.password.invalid) { this.password.markAllAsTouched(); return; }
    this.savingPassword.set(true);
    this.auth.changePassword(this.password.getRawValue()).subscribe({
      next: () => { this.savingPassword.set(false); this.password.reset(); this.toast.success('Password changed.'); },
      error: () => this.savingPassword.set(false),
    });
  }
}
