import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-page">
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo">
            <mat-icon>local_shipping</mat-icon>
            <span>OrderPulse</span>
          </div>
          <h1>Direct Store Delivery & Order Fulfilment</h1>
          <p class="brand-tagline">
            One platform to manage orders, inventory, deliveries, invoices and payments.
          </p>
          <div class="brand-features">
            <div class="feature">
              <div class="feature-icon"><mat-icon>receipt_long</mat-icon></div>
              <div>
                <strong>Unified Order Flow</strong>
                <span>From order creation to cash settlement.</span>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon"><mat-icon>local_shipping</mat-icon></div>
              <div>
                <strong>Route Optimisation</strong>
                <span>Plan, dispatch and track deliveries.</span>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon"><mat-icon>insights</mat-icon></div>
              <div>
                <strong>Real-Time Insights</strong>
                <span>Live dashboards for every team.</span>
              </div>
            </div>
          </div>
          <div class="brand-footer">© 2026 OrderPulse</div>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-container">
          <div class="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to OrderPulse</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email address</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="email" required autocomplete="email">
              <mat-icon matSuffix>mail_outline</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" name="password" [(ngModel)]="password" required autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" aria-label="Toggle password">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (errorMessage()) {
              <div class="error-banner">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <button mat-raised-button color="primary" type="submit" class="submit-btn" [disabled]="loading()">
              @if (loading()) {
                <span class="btn-content">
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Signing in...</span>
                </span>
              } @else {
                <span class="btn-content">Sign In</span>
              }
            </button>
          </form>

          <div class="demo-box">
            <mat-icon>info_outline</mat-icon>
            <div>
              <strong>Demo credentials</strong>
              <div class="demo-line"><span>Email:</span> admin&#64;orderpulse.com</div>
              <div class="demo-line"><span>Password:</span> Admin&#64;123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; background: #f5f7fa; }
    .brand-panel {
      background: linear-gradient(135deg, #1a237e 0%, #303f9f 50%, #5c6bc0 100%);
      color: white; padding: 60px; display: flex; align-items: center;
      position: relative; overflow: hidden;
    }
    .brand-content { position: relative; z-index: 1; width: 100%; max-width: 520px; margin: 0 auto; }
    .brand-logo { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 700; margin-bottom: 48px; }
    .brand-logo mat-icon { font-size: 36px; width: 36px; height: 36px; background: rgba(255,255,255,0.15); border-radius: 10px; padding: 8px; box-sizing: content-box; }
    .brand-panel h1 { font-size: 38px; font-weight: 700; line-height: 1.15; margin-bottom: 16px; color: white; }
    .brand-tagline { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.85); margin-bottom: 48px; }
    .brand-features { display: flex; flex-direction: column; gap: 24px; margin-bottom: 60px; }
    .feature { display: flex; gap: 16px; align-items: flex-start; }
    .feature-icon { flex-shrink: 0; width: 44px; height: 44px; background: rgba(255,255,255,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .feature-icon mat-icon { color: white; font-size: 22px; width: 22px; height: 22px; }
    .feature strong { display: block; font-size: 15px; margin-bottom: 2px; color: white; }
    .feature span { font-size: 13px; color: rgba(255,255,255,0.7); }
    .brand-footer { font-size: 13px; color: rgba(255,255,255,0.6); }
    .form-panel { display: flex; align-items: center; justify-content: center; padding: 40px; background: white; }
    .form-container { width: 100%; max-width: 420px; }
    .form-header { margin-bottom: 32px; }
    .form-header h2 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: var(--op-text-primary); }
    .form-header p { font-size: 15px; color: var(--op-text-secondary); margin: 0; }
    .login-form { display: flex; flex-direction: column; gap: 4px; }
    .login-form .full-width { width: 100%; }
    .error-banner { display: flex; align-items: center; gap: 10px; background: #fef2f2; color: #b91c1c; padding: 12px 16px; border-radius: 8px; border: 1px solid #fecaca; font-size: 14px; margin: 8px 0; }
    .error-banner mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .submit-btn { height: 48px; font-size: 15px; font-weight: 600; margin-top: 8px; }
    .btn-content { display: flex; align-items: center; justify-content: center; gap: 10px; }
    .demo-box { margin-top: 32px; padding: 16px; background: #f8fafc; border: 1px solid var(--op-border); border-radius: 10px; display: flex; gap: 12px; font-size: 13px; }
    .demo-box > mat-icon { color: var(--op-primary); flex-shrink: 0; }
    .demo-box strong { display: block; margin-bottom: 6px; color: var(--op-text-primary); }
    .demo-line { color: var(--op-text-secondary); font-family: monospace; font-size: 12px; }
    .demo-line span { color: var(--op-text-muted); margin-right: 6px; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = 'admin@orderpulse.com';
  password = 'Admin@123';
  hidePassword = true;
  loading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Invalid email or password.');
      }
    });
  }
}
