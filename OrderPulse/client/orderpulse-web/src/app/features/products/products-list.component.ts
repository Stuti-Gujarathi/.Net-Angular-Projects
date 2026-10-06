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
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { ProductFormDialogComponent } from './product-form-dialog.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatChipsModule,
    MatDialogModule, MatMenuModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="op-page-header">
      <div>
        <h1>Products</h1>
        <p class="op-page-subtitle">
          {{ totalActive() }} active product{{ totalActive() === 1 ? '' : 's' }} in your catalog
        </p>
      </div>
      @if (auth.hasPermission('Products.Create')) {
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add_box</mat-icon>
          New Product
        </button>
      }
    </div>

    <!-- Filters -->
    <mat-card class="filters-card">
      <div class="filters-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search products</mat-label>
          <input matInput [(ngModel)]="searchTerm" placeholder="Search by name, SKU or category..." autocomplete="off">
          <mat-icon matPrefix>search</mat-icon>
          @if (searchTerm) {
            <button mat-icon-button matSuffix (click)="clearSearch()" aria-label="Clear">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <div class="filters-right">
          <mat-chip-set>
            <mat-chip [highlighted]="filterLowMargin()" (click)="toggleLowMarginFilter()" class="filter-chip">
              <mat-icon>{{ filterLowMargin() ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              Low margin (&lt; 20%)
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>
    </mat-card>

    <!-- Table -->
    <mat-card class="table-card">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading products...</p>
        </div>
      } @else if (filteredProducts().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <mat-icon>{{ products().length === 0 ? 'inventory_2' : 'search_off' }}</mat-icon>
          </div>
          <h3>{{ products().length === 0 ? 'No products yet' : 'No matches found' }}</h3>
          <p>
            {{ products().length === 0
              ? 'Add your first product to the catalog to start selling.'
              : 'Try a different search term or clear filters.' }}
          </p>
          @if (products().length === 0 && auth.hasPermission('Products.Create')) {
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add_box</mat-icon>
              Add First Product
            </button>
          }
        </div>
      } @else {
        <table mat-table [dataSource]="filteredProducts()" class="products-table">

          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef>SKU</th>
            <td mat-cell *matCellDef="let p">
              <span class="code-badge">{{ p.sku }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Product</th>
            <td mat-cell *matCellDef="let p">
              <div class="name-cell">
                <div class="product-avatar">
                  <mat-icon>inventory_2</mat-icon>
                </div>
                <div>
                  <div class="primary-text">{{ p.name }}</div>
                  <div class="secondary-text">
                    {{ p.categoryName || 'Uncategorised' }} · {{ p.unitOfMeasure }}
                  </div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="cost">
            <th mat-header-cell *matHeaderCellDef>Cost</th>
            <td mat-cell *matCellDef="let p">
              <span class="mono-text">₹{{ p.costPrice | number:'1.2-2' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Price</th>
            <td mat-cell *matCellDef="let p">
              <span class="amount-text">₹{{ p.sellingPrice | number:'1.2-2' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="margin">
            <th mat-header-cell *matHeaderCellDef>Margin</th>
            <td mat-cell *matCellDef="let p">
              <span class="margin-badge" [class.low]="margin(p) < 20" [class.good]="margin(p) >= 20 && margin(p) < 40" [class.high]="margin(p) >= 40">
                {{ margin(p) }}%
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="tax">
            <th mat-header-cell *matHeaderCellDef>Tax</th>
            <td mat-cell *matCellDef="let p">
              <span class="terms-badge">{{ (p.taxRate * 100) | number:'1.0-0' }}%</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let p">
              <span class="status-badge" [class.active]="p.isActive" [class.inactive]="!p.isActive">
                <span class="status-dot"></span>
                {{ p.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-col"></th>
            <td mat-cell *matCellDef="let p" class="actions-col">
              <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu" xPosition="before">
                @if (auth.hasPermission('Products.Update')) {
                  <button mat-menu-item (click)="openEditDialog(p)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                }
                @if (auth.hasPermission('Products.Delete')) {
                  <button mat-menu-item (click)="confirmDelete(p)" class="delete-item">
                    <mat-icon>delete_outline</mat-icon>
                    <span>{{ p.isActive ? 'Deactivate' : 'Delete' }}</span>
                  </button>
                }
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>

        <div class="table-footer">
          <span>Showing {{ filteredProducts().length }} of {{ products().length }} products</span>
        </div>
      }
    </mat-card>
  `,
  styles: [`
    .filters-card { padding: 16px 20px; margin-bottom: 16px; }
    .filters-row { display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 280px; max-width: 500px; }
    .search-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .filters-right { display: flex; gap: 12px; align-items: center; }
    .filter-chip { cursor: pointer; font-size: 13px; font-weight: 500; height: 32px; }
    .filter-chip mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }

    .table-card { padding: 0; overflow: hidden; }

    .products-table { width: 100%; background: white; }
    .products-table th.mat-mdc-header-cell {
      background: #f8fafc;
      color: var(--op-text-secondary);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 14px 16px;
      border-bottom: 1px solid var(--op-border);
    }
    .products-table td.mat-mdc-cell {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .products-table tr.mat-mdc-row:hover { background: #f8fafc !important; }

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

    .name-cell { display: flex; align-items: center; gap: 12px; min-width: 220px; }
    .product-avatar {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .product-avatar mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .primary-text { font-weight: 600; color: var(--op-text-primary); font-size: 14px; line-height: 1.3; }
    .secondary-text { font-size: 12px; color: var(--op-text-muted); line-height: 1.3; }

    .mono-text { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 13px; color: var(--op-text-secondary); }
    .amount-text { font-weight: 600; color: var(--op-text-primary); font-variant-numeric: tabular-nums; }

    .margin-badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
    }
    .margin-badge.low  { background: #fee2e2; color: #991b1b; }
    .margin-badge.good { background: #fef3c7; color: #92400e; }
    .margin-badge.high { background: #dcfce7; color: #166534; }

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
    .status-badge.active { background: #dcfce7; color: #166534; }
    .status-badge.inactive { background: #f1f5f9; color: #64748b; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .actions-col { width: 60px; text-align: right; }
    .delete-item { color: var(--op-danger) !important; }
    .delete-item mat-icon { color: var(--op-danger) !important; }

    .loading-state, .empty-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 80px 24px; text-align: center; gap: 16px;
    }
    .loading-state p { color: var(--op-text-secondary); font-size: 14px; margin: 0; }

    .empty-icon {
      width: 80px; height: 80px; border-radius: 20px;
      background: #f1f5f9;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 8px;
    }
    .empty-icon mat-icon { font-size: 40px; width: 40px; height: 40px; color: #94a3b8; }
    .empty-state h3 { margin: 0; font-size: 18px; font-weight: 600; color: var(--op-text-primary); }
    .empty-state p { margin: 0; color: var(--op-text-secondary); font-size: 14px; max-width: 400px; }

    .table-footer {
      padding: 12px 20px;
      background: #f8fafc;
      border-top: 1px solid var(--op-border);
      font-size: 13px;
      color: var(--op-text-secondary);
    }
  `]
})
export class ProductsListComponent implements OnInit {
  private service = inject(ProductService);
  auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cols = ['sku', 'name', 'cost', 'price', 'margin', 'tax', 'status', 'actions'];

  products = signal<Product[]>([]);
  loading = signal(true);
  searchTerm = '';
  filterLowMargin = signal(false);

  filteredProducts = computed(() => {
    let list = this.products();
    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.categoryName?.toLowerCase().includes(term) ?? false)
      );
    }

    if (this.filterLowMargin()) {
      list = list.filter(p => this.margin(p) < 20);
    }

    return list;
  });

  totalActive = computed(() => this.products().filter(p => p.isActive).length);

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.products.set(data); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  margin(p: Product): number {
    if (!p.costPrice || p.costPrice <= 0) return 0;
    return Math.round(((p.sellingPrice - p.costPrice) / p.costPrice) * 100);
  }

  clearSearch(): void { this.searchTerm = ''; }
  toggleLowMarginFilter(): void { this.filterLowMargin.update(v => !v); }

  openCreateDialog(): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      width: '680px', disableClose: true,
      data: { mode: 'create' }
    });
    ref.afterClosed().subscribe(r => { if (r) this.loadProducts(); });
  }

  openEditDialog(product: Product): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      width: '680px', disableClose: true,
      data: { mode: 'edit', product }
    });
    ref.afterClosed().subscribe(r => { if (r) this.loadProducts(); });
  }

  confirmDelete(product: Product): void {
    const action = product.isActive ? 'deactivate' : 'delete';
    const confirmed = confirm(`Are you sure you want to ${action} "${product.name}"?`);
    if (!confirmed) return;

    this.service.delete(product.id).subscribe({
      next: () => {
        this.snackBar.open(`Product "${product.name}" ${action}d`, 'Close', { duration: 3000 });
        this.loadProducts();
      },
      error: () => this.snackBar.open(`Failed to ${action} product`, 'Close', { duration: 3000 })
    });
  }
}
