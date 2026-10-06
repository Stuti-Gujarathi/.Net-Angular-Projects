import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminUser } from '../../core/models/models';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { InrPipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'at-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, IconComponent, InrPipe],
  template: `
    <header class="page-head">
      <div><h1>Users</h1><p>{{ travellers() }} travellers and {{ admins() }} admins. Deactivated users are signed out on their next request.</p></div>
    </header>
    <div class="toolbar">
      <label class="search">
        <at-icon name="search" [size]="16" />
        <input type="search" placeholder="Name, email or phone" [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Search users" />
      </label>
    </div>
    <section class="card">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>User</th><th>Role</th><th>Phone</th><th class="num">Bookings</th><th class="num">Spent</th><th>Joined</th><th>Last login</th><th>Active</th></tr></thead>
          <tbody>
            @if (users() === null) { @for (i of [1, 2, 3, 4]; track i) { <tr><td colspan="8"><div class="skeleton" style="height: 30px"></div></td></tr> } }
            @for (u of filtered(); track u.id) {
              <tr [class.off]="!u.isActive">
                <td><span class="who"><span class="av" [class.admin]="u.role === 'Admin'">{{ initials(u.fullName) }}</span><span><b>{{ u.fullName }}</b><small class="muted">{{ u.email }}</small></span></span></td>
                <td><span class="badge no-dot" [class.badge-plum]="u.role === 'Admin'" [class.badge-info]="u.role === 'User'">{{ u.role === 'Admin' ? 'Admin' : 'Traveller' }}</span></td>
                <td class="tnum">{{ u.phone }}</td>
                <td class="num">{{ u.bookings }}</td>
                <td class="num">{{ u.totalSpent | inr }}</td>
                <td class="nowrap">{{ u.createdAt | date: 'd MMM y' }}</td>
                <td class="nowrap muted">{{ u.lastLoginAt ? (u.lastLoginAt | date: 'd MMM, HH:mm') : 'Never' }}</td>
                <td>
                  <label class="switch" [title]="u.id === me() ? 'You can\\'t deactivate yourself' : ''">
                    <input type="checkbox" [checked]="u.isActive" [disabled]="u.id === me()" (change)="toggle(u)" [attr.aria-label]="'Active ' + u.fullName" /><span></span>
                  </label>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styleUrl: './admin-shared.scss',
  styles: [`
    .who { display: inline-flex; gap: .7rem; align-items: center; > span:last-child { display: grid; } small { font-size: .78rem; } }
    .av { width: 34px; height: 34px; border-radius: 10px; background: var(--paper); color: var(--ink-3); display: grid; place-items: center; font-weight: 700; font-size: .78rem; }
    .av.admin { background: var(--plum-soft); color: var(--plum); }
    tr.off td:not(:last-child) { opacity: .5; }
  `],
})
export class AdminUsersComponent {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  protected readonly me = computed(() => inject(AuthService).user()?.id);

  protected readonly users = signal<AdminUser[] | null>(null);
  protected readonly query = signal('');
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return (this.users() ?? []).filter((u) => !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
  });
  protected readonly travellers = computed(() => (this.users() ?? []).filter((u) => u.role === 'User').length);
  protected readonly admins = computed(() => (this.users() ?? []).filter((u) => u.role === 'Admin').length);

  constructor() {
    this.admin.users().subscribe((u) => this.users.set(u));
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  }

  toggle(u: AdminUser): void {
    this.admin.setUserActive(u.id, !u.isActive).subscribe((updated) => {
      this.users.update((list) => (list ?? []).map((x) => (x.id === updated.id ? updated : x)));
      this.toast.success(`${updated.fullName} ${updated.isActive ? 'reactivated' : 'deactivated'}.`);
    });
  }
}
