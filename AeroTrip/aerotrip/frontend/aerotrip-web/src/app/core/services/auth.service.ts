import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_ERROR_TOAST } from '../interceptors/error.interceptor';
import { AuthResponse, User } from '../models/models';

const STORAGE_KEY = 'aerotrip.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = `${environment.apiUrl}/auth`;

  private readonly session = signal<AuthResponse | null>(restoreSession());

  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.user()?.role === 'Admin');
  readonly firstName = computed(() => this.user()?.fullName.split(' ')[0] ?? '');
  readonly initials = computed(() =>
    (this.user()?.fullName ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join(''),
  );

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { email, password }, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })
      .pipe(tap((res) => this.persist(res)));
  }

  register(payload: { fullName: string; email: string; phone: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, payload, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })
      .pipe(tap((res) => this.persist(res)));
  }

  updateProfile(payload: { fullName: string; phone: string }): Observable<User> {
    return this.http.put<User>(`${this.api}/me`, payload).pipe(tap((user) => this.patchUser(user)));
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.post<void>(`${this.api}/change-password`, payload);
  }

  logout(redirect = true): void {
    localStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
    if (redirect) this.router.navigateByUrl('/');
  }

  /** Where to land after login when there's no returnUrl. */
  homeRoute(): string {
    return this.isAdmin() ? '/admin' : '/account';
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this.session.set(res);
  }

  private patchUser(user: User): void {
    const current = this.session();
    if (current) this.persist({ ...current, user });
  }
}

function restoreSession(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthResponse;
    if (new Date(session.expiresAtUtc).getTime() <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}
