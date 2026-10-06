import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/services/auth.service';

interface Stat {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule,
    MatButtonModule, MatChipsModule, MatProgressBarModule
  ],
  template: `
    <div class="dashboard">
      <!-- Page Header -->
      <div class="op-page-header">
        <div>
          <h1>Good morning, {{ firstName() }} 👋</h1>
          <p class="op-page-subtitle">
            Here's what's happening with your business today — {{ today | date:'EEEE, MMMM d, y' }}
          </p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button>
            <mat-icon>download</mat-icon>
            Export
          </button>
          @if (auth.hasPermission('Orders.Create')) {
            <button mat-raised-button color="primary">
              <mat-icon>add</mat-icon>
              New Order
            </button>
          }
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="stats-grid">
        @for (stat of stats; track stat.label) {
          <div class="stat-card" [style.--accent]="stat.color">
            <div class="stat-header">
              <div class="stat-icon" [style.background]="stat.bg">
                <mat-icon [style.color]="stat.color">{{ stat.icon }}</mat-icon>
              </div>
              @if (stat.trend) {
                <div class="stat-trend" [class.up]="stat.trendUp" [class.down]="!stat.trendUp">
                  <mat-icon>{{ stat.trendUp ? 'trending_up' : 'trending_down' }}</mat-icon>
                  <span>{{ stat.trend }}</span>
                </div>
              }
            </div>
            <div class="stat-body">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
            <div class="stat-bar" [style.background]="stat.color"></div>
          </div>
        }
      </div>

      <!-- Middle Row: Order Funnel + Quick Stats -->
      <div class="middle-grid">
        <mat-card class="funnel-card">
          <div class="card-header">
            <div>
              <h3>Order Funnel</h3>
              <p class="card-subtitle">Today's order-to-cash pipeline</p>
            </div>
            <button mat-icon-button><mat-icon>more_horiz</mat-icon></button>
          </div>

          <div class="funnel">
            @for (stage of funnel; track stage.label) {
              <div class="funnel-stage">
                <div class="funnel-label">
                  <span class="stage-name">{{ stage.label }}</span>
                  <span class="stage-count">{{ stage.count }}</span>
                </div>
                <div class="funnel-bar-wrapper">
                  <div class="funnel-bar"
                       [style.width.%]="stage.percent"
                       [style.background]="stage.color">
                  </div>
                </div>
              </div>
            }
          </div>
        </mat-card>

        <mat-card class="quick-card">
          <div class="card-header">
            <h3>Low Stock Alerts</h3>
            <button mat-button color="primary">View all</button>
          </div>

          <div class="alerts-list">
            @for (item of lowStockItems; track item.sku) {
              <div class="alert-item">
                <div class="alert-icon" [class.critical]="item.critical">
                  <mat-icon>{{ item.critical ? 'error' : 'warning' }}</mat-icon>
                </div>
                <div class="alert-body">
                  <div class="alert-name">{{ item.name }}</div>
                  <div class="alert-meta">{{ item.sku }} · Available: {{ item.available }}</div>
                </div>
                <div class="alert-value" [class.critical]="item.critical">
                  {{ item.available }}/{{ item.reorder }}
                </div>
              </div>
            }
          </div>
        </mat-card>
      </div>

      <!-- Bottom Row: Permissions (as your account capabilities) -->
      <mat-card class="permissions-card">
        <div class="card-header">
          <div>
            <h3>Your Account Access</h3>
            <p class="card-subtitle">
              You have <strong>{{ auth.permissions().length }} permissions</strong> across {{ permissionModules().length }} modules
            </p>
          </div>
          <mat-chip-set>
            <mat-chip color="primary" highlighted>{{ auth.roles().join(', ') }}</mat-chip>
          </mat-chip-set>
        </div>

        <div class="permissions-grid">
          @for (module of permissionModules(); track module.name) {
            <div class="permission-module">
              <div class="module-header">
                <mat-icon>{{ module.icon }}</mat-icon>
                <span class="module-name">{{ module.name }}</span>
                <span class="module-count">{{ module.permissions.length }}</span>
              </div>
              <div class="module-perms">
                @for (p of module.permissions; track p) {
                  <span class="perm-chip">{{ p.replace(module.name + '.', '') }}</span>
                }
              </div>
            </div>
          }
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1600px; }

    .header-actions {
      display: flex;
      gap: 12px;
      button { font-weight: 600; }
    }

    // KPI Cards
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border: 1px solid var(--op-border);
      border-radius: var(--op-radius);
      padding: 20px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--op-shadow-lg);
      }
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon { font-size: 26px; width: 26px; height: 26px; }
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 20px;

      mat-icon { font-size: 14px; width: 14px; height: 14px; }

      &.up { background: #dcfce7; color: #16a34a; }
      &.down { background: #fee2e2; color: #dc2626; }
    }

    .stat-body { display: flex; flex-direction: column; gap: 4px; }

    .stat-label {
      font-size: 13px;
      color: var(--op-text-secondary);
      font-weight: 500;
    }

    .stat-value {
      font-size: 30px;
      font-weight: 700;
      color: var(--op-text-primary);
      letter-spacing: -0.02em;
    }

    .stat-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      opacity: 0.15;
    }

    // Middle grid
    .middle-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    @media (max-width: 1100px) {
      .middle-grid { grid-template-columns: 1fr; }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      h3 { margin: 0 0 4px; font-size: 17px; font-weight: 700; }
      .card-subtitle {
        font-size: 13px;
        color: var(--op-text-secondary);
        margin: 0;
        strong { color: var(--op-primary); font-weight: 600; }
      }
    }

    // Funnel
    .funnel-card { padding: 24px; }

    .funnel { display: flex; flex-direction: column; gap: 14px; }

    .funnel-stage { display: flex; flex-direction: column; gap: 6px; }

    .funnel-label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;

      .stage-name { color: var(--op-text-secondary); font-weight: 500; }
      .stage-count { color: var(--op-text-primary); font-weight: 700; font-family: monospace; }
    }

    .funnel-bar-wrapper {
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
    }

    .funnel-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease;
    }

    // Quick card / Alerts
    .quick-card { padding: 24px; }

    .alerts-list { display: flex; flex-direction: column; gap: 12px; }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid var(--op-border);
    }

    .alert-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #fef3c7;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { color: #d97706; font-size: 20px; width: 20px; height: 20px; }

      &.critical {
        background: #fee2e2;
        mat-icon { color: #dc2626; }
      }
    }

    .alert-body { flex: 1; min-width: 0; }

    .alert-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--op-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .alert-meta {
      font-size: 12px;
      color: var(--op-text-muted);
      font-family: monospace;
    }

    .alert-value {
      font-size: 13px;
      font-weight: 700;
      font-family: monospace;
      color: #d97706;

      &.critical { color: #dc2626; }
    }

    // Permissions grid
    .permissions-card { padding: 24px; }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
      margin-top: 8px;
    }

    .permission-module {
      background: #f8fafc;
      border: 1px solid var(--op-border);
      border-radius: 10px;
      padding: 14px;
    }

    .module-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;

      mat-icon {
        color: var(--op-primary);
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .module-name {
        font-size: 13px;
        font-weight: 700;
        color: var(--op-text-primary);
        flex: 1;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .module-count {
        background: white;
        border: 1px solid var(--op-border);
        color: var(--op-text-secondary);
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 10px;
      }
    }

    .module-perms {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .perm-chip {
      background: white;
      border: 1px solid var(--op-border);
      color: var(--op-text-secondary);
      font-size: 11px;
      font-family: monospace;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 500;
    }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
  today = new Date();

  stats: Stat[] = [
    { label: 'Orders Today',    value: '124',    icon: 'receipt_long',  trend: '+12.5%', trendUp: true,  color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Pending Orders',  value: '18',     icon: 'pending',       trend: '-3.2%',  trendUp: false, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Delivered',       value: '86',     icon: 'check_circle',  trend: '+8.1%',  trendUp: true,  color: '#10b981', bg: '#d1fae5' },
    { label: 'Revenue Today',   value: '₹4.82L', icon: 'payments',      trend: '+15.3%', trendUp: true,  color: '#8b5cf6', bg: '#ede9fe' },
  ];

  funnel = [
    { label: 'Confirmed',  count: 124, percent: 100, color: '#3b82f6' },
    { label: 'Picked',     count: 108, percent: 87,  color: '#6366f1' },
    { label: 'Packed',     count: 98,  percent: 79,  color: '#8b5cf6' },
    { label: 'Dispatched', count: 92,  percent: 74,  color: '#a855f7' },
    { label: 'Delivered',  count: 86,  percent: 69,  color: '#10b981' },
    { label: 'Invoiced',   count: 84,  percent: 68,  color: '#14b8a6' },
    { label: 'Paid',       count: 71,  percent: 57,  color: '#22c55e' },
  ];

  lowStockItems = [
    { name: 'Coca Cola 500ml',   sku: 'COKE-500',   available: 12,  reorder: 100, critical: true },
    { name: 'Mineral Water 1L',  sku: 'WATER-1L',   available: 20,  reorder: 80,  critical: true },
    { name: 'Pepsi 500ml',       sku: 'PEPSI-500',  available: 45,  reorder: 50,  critical: false },
  ];

  firstName(): string {
    return this.auth.currentUser()?.fullName?.split(' ')[0] ?? 'User';
  }

  permissionModules() {
    const perms = this.auth.permissions();
    const modules: Record<string, string[]> = {};

    for (const p of perms) {
      const [mod] = p.split('.');
      if (!modules[mod]) modules[mod] = [];
      modules[mod].push(p);
    }

    const iconMap: Record<string, string> = {
      Orders: 'receipt_long',
      Customers: 'store',
      Products: 'inventory_2',
      Inventory: 'warehouse',
      Warehouses: 'business',
      Fulfilment: 'local_shipping',
      Routes: 'route',
      Deliveries: 'delivery_dining',
      Invoices: 'description',
      Payments: 'payments',
      Returns: 'assignment_return',
      Reports: 'analytics',
      Users: 'group',
      Roles: 'admin_panel_settings',
      Dashboard: 'dashboard',
      AuditLogs: 'history',
    };

    return Object.entries(modules).map(([name, permissions]) => ({
      name,
      permissions,
      icon: iconMap[name] ?? 'settings'
    }));
  }
}
