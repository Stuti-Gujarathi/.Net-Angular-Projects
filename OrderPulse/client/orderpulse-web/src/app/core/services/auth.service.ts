import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, CurrentUser, LoginRequest } from '../models/user.model';

const TOKEN_KEY = 'orderpulse_token';
const USER_KEY = 'orderpulse_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSignal = signal<CurrentUser | null>(this.loadUserFromStorage());
  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  permissions = computed(() => this.currentUserSignal()?.permissions ?? []);
  roles = computed(() => this.currentUserSignal()?.roles ?? []);

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(response => this.saveSession(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
  hasPermission(p: string): boolean { return this.permissions().includes(p); }
  hasAnyPermission(ps: string[]): boolean { return ps.some(p => this.hasPermission(p)); }
  hasRole(r: string): boolean { return this.roles().includes(r); }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    const user: CurrentUser = {
      userId: response.userId.toString(), email: response.email,
      fullName: response.fullName, roles: response.roles,
      permissions: response.permissions
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private loadUserFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
}
