import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, RouterOutlet, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatTooltipModule, MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav
        mode="side"
        [opened]="!collapsed()"
        [class.collapsed]="collapsed()"
        class="sidenav">

        <!-- Brand -->
        <div class="brand" [class.collapsed]="collapsed()">
          <div class="brand-icon">
            <mat-icon>local_shipping</mat-icon>
          </div>
          @if (!collapsed()) {
            <div class="brand-text">
              <span class="brand-name">OrderPulse</span>
              <span class="brand-subtitle">DSD Platform</span>
            </div>
          }
        </div>

        <!-- Navigation -->
        <div class="nav-section">
          @if (!collapsed()) {
            <div class="nav-label">MAIN</div>
          }
          <mat-nav-list>
            @for (item of visibleNavItems(); track item.route) {
              <a
                mat-list-item
                [routerLink]="item.route"
                routerLinkActive="active-link"
                [matTooltip]="collapsed() ? item.label : ''"
                matTooltipPosition="right">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                @if (!collapsed()) {
                  <span matListItemTitle>{{ item.label }}</span>
                }
              </a>
            }
          </mat-nav-list>
        </div>

        <div class="nav-spacer"></div>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          @if (!collapsed()) {
            <div class="version-badge">v1.0.0</div>
          }
        </div>
      </mat-sidenav>

      <mat-sidenav-content [class.content-collapsed]="collapsed()">
        <!-- Toolbar -->
        <mat-toolbar class="app-toolbar">
          <button mat-icon-button (click)="toggleSidebar()" class="menu-btn">
            <mat-icon>{{ collapsed() ? 'menu' : 'menu_open' }}</mat-icon>
          </button>

          <!-- Breadcrumb -->
          <div class="breadcrumb">
            <span class="breadcrumb-item">OrderPulse</span>
            <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
            <span class="breadcrumb-current">{{ currentPageTitle() }}</span>
          </div>

          <span class="spacer"></span>

          <!-- Quick Actions -->
          <button mat-icon-button class="toolbar-icon-btn" matTooltip="Notifications">
            <mat-icon>notifications_none</mat-icon>
          </button>
          <button mat-icon-button class="toolbar-icon-btn" matTooltip="Help">
            <mat-icon>help_outline</mat-icon>
          </button>

          <!-- User Menu -->
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
            <div class="user-avatar">{{ userInitials() }}</div>
            <div class="user-meta">
              <span class="user-name">{{ auth.currentUser()?.fullName }}</span>
              <span class="user-role">{{ auth.roles()[0] }}</span>
            </div>
            <mat-icon class="chevron">expand_more</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu" xPosition="before" class="user-menu">
            <div class="menu-header">
              <div class="user-avatar large">{{ userInitials() }}</div>
              <div>
                <div class="menu-name">{{ auth.currentUser()?.fullName }}</div>
                <div class="menu-email">{{ auth.currentUser()?.email }}</div>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item>
              <mat-icon>person_outline</mat-icon>
              <span>My Profile</span>
            </button>
            <button mat-menu-item>
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()" class="logout-item">
              <mat-icon>logout</mat-icon>
              <span>Sign out</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Content -->
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container { height: 100vh; }

    // SIDEBAR
    .sidenav {
      width: 260px;
      background: linear-gradient(180deg, #1a237e 0%, #283593 100%);
      border-right: none;
      transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;

      &.collapsed { width: 76px; }
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      height: 72px;
      border-bottom: 1px solid rgba(255,255,255,0.08);

      &.collapsed { justify-content: center; padding: 20px 0; }
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ffa000 0%, #ff6f00 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 8px rgba(255, 160, 0, 0.3);

      mat-icon { color: white; font-size: 22px; width: 22px; height: 22px; }
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .brand-name {
      font-size: 17px;
      font-weight: 700;
      color: white;
      letter-spacing: -0.01em;
    }

    .brand-subtitle {
      font-size: 11px;
      color: rgba(255,255,255,0.55);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 500;
    }

    .nav-section {
      padding: 16px 8px 8px;
      flex: 1;
      overflow-y: auto;
    }

    .nav-label {
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
      padding: 0 16px 8px;
    }

    mat-nav-list {
      padding: 0;

      a {
        color: rgba(255,255,255,0.75) !important;
        margin: 2px 8px !important;
        border-radius: 8px;
        height: 44px !important;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.15s ease;

        mat-icon { color: rgba(255,255,255,0.65); font-size: 20px; width: 20px; height: 20px; }

        &:hover {
          background: rgba(255,255,255,0.08) !important;
          color: white !important;
          mat-icon { color: white; }
        }

        &.active-link {
          background: rgba(255,255,255,0.14) !important;
          color: white !important;
          font-weight: 600;
          box-shadow: inset 3px 0 0 #ffa000;

          mat-icon { color: #ffa000; }
        }
      }
    }

    .sidenav.collapsed mat-nav-list a {
      justify-content: center;
      padding: 0 !important;
    }

    .nav-spacer { flex: 0; }

    .sidebar-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .version-badge {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      font-family: monospace;
    }

    // TOOLBAR
    .app-toolbar {
      background: white;
      color: var(--op-text-primary);
      border-bottom: 1px solid var(--op-border);
      height: 72px;
      padding: 0 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .menu-btn {
      color: var(--op-text-secondary);
      margin-right: 8px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;

      .breadcrumb-item { color: var(--op-text-muted); font-weight: 500; }
      .breadcrumb-sep { font-size: 18px; width: 18px; height: 18px; color: var(--op-text-muted); }
      .breadcrumb-current { color: var(--op-text-primary); font-weight: 600; }
    }

    .spacer { flex: 1; }

    .toolbar-icon-btn {
      color: var(--op-text-secondary);
      margin: 0 2px;
    }

    .user-btn {
      margin-left: 12px;
      padding: 4px 12px 4px 4px !important;
      border-radius: 30px !important;
      height: 48px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid var(--op-border);
      background: white;
      transition: all 0.15s;

      &:hover { background: #f8fafc; border-color: #cbd5e1; }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #303f9f 0%, #5c6bc0 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
      flex-shrink: 0;

      &.large { width: 44px; height: 44px; font-size: 15px; }
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--op-text-primary);
    }

    .user-role {
      font-size: 11px;
      color: var(--op-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chevron {
      color: var(--op-text-muted);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    // User menu
    ::ng-deep .user-menu {
      .mat-mdc-menu-content { padding: 0 !important; }
    }

    .menu-header {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px;
      background: #f8fafc;
    }

    .menu-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--op-text-primary);
    }

    .menu-email {
      font-size: 12px;
      color: var(--op-text-secondary);
    }

    .logout-item {
      color: var(--op-danger) !important;
      mat-icon { color: var(--op-danger) !important; }
    }

    // CONTENT
    .content {
      padding: 28px;
      background: var(--op-bg);
      min-height: calc(100vh - 72px);
      transition: padding 0.25s;
    }

    // Mobile
    @media (max-width: 768px) {
      .sidenav { width: 260px; }
      .user-meta { display: none; }
      .breadcrumb-item, .breadcrumb-sep { display: none; }
      .content { padding: 16px; }
    }
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);
  collapsed = signal(false);

  private navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Orders',    icon: 'receipt_long', route: '/orders', permission: 'Orders.View' },
    { label: 'Customers', icon: 'store', route: '/customers', permission: 'Customers.View' },
    { label: 'Products',  icon: 'inventory_2', route: '/products', permission: 'Products.View' },
  ];

  visibleNavItems = () =>
    this.navItems.filter(item => !item.permission || this.auth.hasPermission(item.permission));

  currentPageTitle(): string {
    const path = window.location.pathname;
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/orders': 'Orders',
      '/customers': 'Customers',
      '/products': 'Products',
    };
    return map[path] ?? 'Dashboard';
  }

  userInitials(): string {
    const name = this.auth.currentUser()?.fullName ?? '';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0,2).toUpperCase();
  }

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
