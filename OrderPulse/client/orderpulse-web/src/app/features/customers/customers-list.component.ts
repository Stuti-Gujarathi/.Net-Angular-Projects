import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { Customer } from '../../core/models/customer.model';
import { CustomerFormDialogComponent } from './customer-form-dialog.component';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatChipsModule,
    MatDialogModule, MatTooltipModule, MatProgressSpinnerModule, MatMenuModule
  ],
  template: `
    <div class="op-page-header">
      <div>
        <h1>Customers</h1>
        <p class="op-page-subtitle">
          {{ totalActive() }} active customer{{ totalActive() === 1 ? '' : 's' }} in your network
        </p>
      </div>
      @if (auth.hasPermission('Customers.Create')) {
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add_business</mat-icon>
          New Customer
        </button>
      }
    </div>

    <!-- Filters -->
    <mat-card class="filters-card">
      <div class="filters-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search customers</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()"
                 placeholder="Search by name, code, email or phone..." autocomplete="off">
          <mat-icon matPrefix>search</mat-icon>
          @if (searchTerm) {
            <button mat-icon-button matSuffix (click)="clearSearch()" aria-label="Clear">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <div class="filters-right">
          <mat-chip-set>
            <mat-chip [highlighted]="filterActive()" (click)="toggleActiveFilter()" class="filter-chip">
              <mat-icon>{{ filterActive() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              Active only
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>
    </mat-card>

    <!-- Table Card -->
    <mat-card class="table-card">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading customers...</p>
        </div>
      } @else if (filteredCustomers().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <mat-icon>{{ customers().length === 0 ? 'storefront' : 'search_off' }}</mat-icon>
          </div>
          <h3>{{ customers().length === 0 ? 'No customers yet' : 'No matches found' }}</h3>
          <p>
            {{ customers().length === 0
              ? 'Get started by adding your first customer to the network.'
              : 'Try a different search term or clear filters.' }}
          </p>
          @if (customers().length === 0 && auth.hasPermission('Customers.Create')) {
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add_business</mat-icon>
              Add First Customer
            </button>
          }
        </div>
      } @else {
        <div class="table-wrapper">
          <table mat-table [dataSource]="filteredCustomers()" class="customers-table">

            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let c">
                <div class="code-cell">
                  <span class="code-badge">{{ c.customerCode }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let c">
                <div class="name-cell">
                  <div class="avatar">{{ initials(c.name) }}</div>
                  <div>
                    <div class="primary-text">{{ c.name }}</div>
                    <div class="secondary-text">{{ c.email || '—' }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let c">
                <span class="mono-text">{{ c.phone || '—' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="creditLimit">
              <th mat-header-cell *matHeaderCellDef>Credit Limit</th>
              <td mat-cell *matCellDef="let c">
                <span class="amount-text">₹{{ c.creditLimit | number }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="terms">
              <th mat-header-cell *matHeaderCellDef>Terms</th>
              <td mat-cell *matCellDef="let c">
                <span class="terms-badge">Net {{ c.paymentTermsDays }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">
                <span class="status-badge" [class.active]="c.isActive" [class.inactive]="!c.isActive">
                  <span class="status-dot"></span>
                  {{ c.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-col"></th>
              <td mat-cell *matCellDef="let c" class="actions-col">
                <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu" xPosition="before">
                  @if (auth.hasPermission('Customers.Update')) {
                    <button mat-menu-item (click)="openEditDialog(c)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                  }
                  @if (auth.hasPermission('Customers.Delete')) {
                    <button mat-menu-item (click)="confirmDelete(c)" class="delete-item">
                      <mat-icon>delete_outline</mat-icon>
                      <span>{{ c.isActive ? 'Deactivate' : 'Delete' }}</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        </div>

        <div class="table-footer">
          <span>Showing {{ filteredCustomers().length }} of {{ customers().length }} customers</span>
        </div>
      }
    </mat-card>
  `,
  styles: [`
    .filters-card {
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 1;
      min-width: 280px;
      max-width: 500px;
    }
    .search-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .filters-right { display: flex; gap: 12px; align-items: center; }

    .filter-chip {
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      height: 32px;
    }
    .filter-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .table-card { padding: 0; overflow: hidden; }

    .table-wrapper { overflow-x: auto; }

    .customers-table {
      width: 100%;
      background: white;
    }

    .customers-table th.mat-mdc-header-cell {
      background: #f8fafc;
      color: var(--op-text-secondary);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 14px 16px;
      border-bottom: 1px solid var(--op-border);
    }

    .customers-table td.mat-mdc-cell {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }

    .customers-table tr.mat-mdc-row {
      transition: background 0.15s;
      cursor: default;
    }
    .customers-table tr.mat-mdc-row:hover {
      background: #f8fafc !important;
    }

    // Cell styles
    .code-cell { min-width: 120px; }
    .code-badge {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 12px;
      font-weight: 600;
      color: var(--op-primary);
      background: #eef2ff;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #c7d2fe;
    }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 220px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #303f9f 0%, #5c6bc0 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .primary-text {
      font-weight: 600;
      color: var(--op-text-primary);
      font-size: 14px;
      line-height: 1.3;
    }
    .secondary-text {
      font-size: 12px;
      color: var(--op-text-muted);
      line-height: 1.3;
    }

    .mono-text {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 13px;
      color: var(--op-text-secondary);
    }

    .amount-text {
      font-weight: 600;
      color: var(--op-text-primary);
      font-variant-numeric: tabular-nums;
    }

    .terms-badge {
      display: inline-block;
      background: #f1f5f9;
      color: var(--op-text-secondary);
      font-size: 12px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 6px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .status-badge.active {
      background: #dcfce7;
      color: #166534;
    }
    .status-badge.inactive {
      background: #f1f5f9;
      color: #64748b;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .actions-col {
      width: 60px;
      text-align: right;
    }

    .delete-item {
      color: var(--op-danger) !important;
      mat-icon { color: var(--op-danger) !important; }
    }

    // States
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      text-align: center;
      gap: 16px;
    }
    .loading-state p { color: var(--op-text-secondary); font-size: 14px; margin: 0; }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .empty-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #94a3b8;
    }
    .empty-state h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--op-text-primary);
    }
    .empty-state p {
      margin: 0;
      color: var(--op-text-secondary);
      font-size: 14px;
      max-width: 400px;
    }

    .table-footer {
      padding: 12px 20px;
      background: #f8fafc;
      border-top: 1px solid var(--op-border);
      font-size: 13px;
      color: var(--op-text-secondary);
    }
  `]
})
export class CustomersListComponent implements OnInit {
  private service = inject(CustomerService);
  auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cols = ['code', 'name', 'phone', 'creditLimit', 'terms', 'status', 'actions'];

  customers = signal<Customer[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterActive = signal(false);

  filteredCustomers = computed(() => {
    let list = this.customers();
    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.customerCode.toLowerCase().includes(term) ||
        (c.email?.toLowerCase().includes(term) ?? false) ||
        (c.phone?.toLowerCase().includes(term) ?? false)
      );
    }

    if (this.filterActive()) {
      list = list.filter(c => c.isActive);
    }

    return list;
  });

  totalActive = computed(() => this.customers().filter(c => c.isActive).length);

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load customers', 'Close', { duration: 3000 });
      }
    });
  }

  initials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  onSearchChange(): void { /* triggers via computed signal */ }
  clearSearch(): void { this.searchTerm = ''; }
  toggleActiveFilter(): void { this.filterActive.update(v => !v); }

  openCreateDialog(): void {
    const ref = this.dialog.open(CustomerFormDialogComponent, {
      width: '620px',
      disableClose: true,
      data: { mode: 'create' }
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadCustomers(); });
  }

  openEditDialog(customer: Customer): void {
    const ref = this.dialog.open(CustomerFormDialogComponent, {
      width: '620px',
      disableClose: true,
      data: { mode: 'edit', customer }
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadCustomers(); });
  }

  confirmDelete(customer: Customer): void {
    const action = customer.isActive ? 'deactivate' : 'delete';
    const confirmed = confirm(`Are you sure you want to ${action} "${customer.name}"? This cannot be undone.`);
    if (!confirmed) return;

    this.service.delete(customer.id).subscribe({
      next: () => {
        this.snackBar.open(`Customer "${customer.name}" ${action}d successfully`, 'Close', { duration: 3000 });
        this.loadCustomers();
      },
      error: () => {
        this.snackBar.open(`Failed to ${action} customer`, 'Close', { duration: 3000 });
      }
    });
  }
}
