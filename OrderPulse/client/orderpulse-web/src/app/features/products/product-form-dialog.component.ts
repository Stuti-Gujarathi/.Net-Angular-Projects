import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { Product, Category, CreateProductRequest, UpdateProductRequest } from '../../core/models/product.model';

export interface ProductFormData {
  product?: Product;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatSlideToggleModule
  ],
  template: `
    <div class="dialog-header">
      <div class="header-icon" [class.edit]="data.mode === 'edit'">
        <mat-icon>{{ data.mode === 'create' ? 'add_box' : 'edit' }}</mat-icon>
      </div>
      <div>
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Product' : 'Edit Product' }}</h2>
        <p class="subtitle">
          {{ data.mode === 'create' ? 'Add a new product to your catalog' : 'Update product details' }}
        </p>
      </div>
    </div>

    <mat-dialog-content>
      <form #form="ngForm" class="product-form">
        <div class="row-2">
          @if (data.mode === 'create') {
            <mat-form-field appearance="outline">
              <mat-label>SKU</mat-label>
              <input matInput [(ngModel)]="model.sku" name="sku" required placeholder="COKE-500" autocomplete="off">
              <mat-icon matSuffix>qr_code</mat-icon>
              <mat-hint>Unique stock-keeping unit</mat-hint>
            </mat-form-field>
          }
          <mat-form-field appearance="outline">
            <mat-label>Unit of Measure</mat-label>
            <mat-select [(ngModel)]="model.unitOfMeasure" name="unitOfMeasure" required>
              <mat-option value="EA">EA — Each</mat-option>
              <mat-option value="BOX">BOX — Box</mat-option>
              <mat-option value="CASE">CASE — Case</mat-option>
              <mat-option value="KG">KG — Kilogram</mat-option>
              <mat-option value="L">L — Litre</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Product Name</mat-label>
          <input matInput [(ngModel)]="model.name" name="name" required placeholder="e.g. Coca Cola 500ml" autocomplete="off">
          <mat-icon matSuffix>inventory_2</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="model.description" name="description" rows="2" placeholder="Optional product description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="model.categoryId" name="categoryId">
            <mat-option [value]="undefined">No category</mat-option>
            @for (cat of categories(); track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }} ({{ cat.productCount }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="row-3">
          <mat-form-field appearance="outline">
            <mat-label>Cost Price (₹)</mat-label>
            <input matInput type="number" [(ngModel)]="model.costPrice" name="costPrice" required min="0" step="0.01">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Selling Price (₹)</mat-label>
            <input matInput type="number" [(ngModel)]="model.sellingPrice" name="sellingPrice" required min="0" step="0.01">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tax Rate (%)</mat-label>
            <input matInput type="number" [(ngModel)]="model.taxRatePercent" name="taxRatePercent" required min="0" max="100" step="0.5">
          </mat-form-field>
        </div>

        @if (model.sellingPrice > 0 && model.costPrice > 0) {
          <div class="margin-preview">
            <mat-icon>trending_up</mat-icon>
            <span>Margin: <strong>{{ marginPercent() }}%</strong> (₹{{ (model.sellingPrice - model.costPrice).toFixed(2) }})</span>
          </div>
        }

        @if (data.mode === 'edit') {
          <div class="toggle-row">
            <mat-slide-toggle [(ngModel)]="model.isActive" name="isActive" color="primary">
              Active Product
            </mat-slide-toggle>
            <span class="toggle-hint">Inactive products cannot be ordered</span>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" [disabled]="saving">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!form.valid || saving">
        @if (saving) {
          <span>Saving...</span>
        } @else {
          <span class="btn-content">
            <mat-icon>{{ data.mode === 'create' ? 'check' : 'save' }}</mat-icon>
            {{ data.mode === 'create' ? 'Create Product' : 'Save Changes' }}
          </span>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header { display: flex; gap: 16px; align-items: flex-start; padding: 24px 24px 8px; }
    .header-icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    .header-icon.edit {
      background: linear-gradient(135deg, #f59e0b, #f97316);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
    }
    .header-icon mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }

    h2[mat-dialog-title] { margin: 0 !important; font-size: 22px; font-weight: 700; padding: 0 !important; }
    .subtitle { margin: 4px 0 0; font-size: 13px; color: var(--op-text-secondary); }

    mat-dialog-content { padding: 16px 24px !important; min-width: 600px; }

    .product-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

    .margin-preview {
      display: flex; align-items: center; gap: 8px;
      background: #f0fdf4; color: #166534;
      padding: 10px 14px; border-radius: 8px;
      font-size: 13px; border: 1px solid #bbf7d0;
      margin-top: 4px;
    }
    .margin-preview mat-icon { color: #16a34a; font-size: 18px; width: 18px; height: 18px; }

    .toggle-row { display: flex; flex-direction: column; gap: 4px; padding: 12px 0; }
    .toggle-hint { font-size: 12px; color: var(--op-text-muted); padding-left: 48px; }

    mat-dialog-actions {
      padding: 16px 24px !important;
      border-top: 1px solid var(--op-border);
      margin: 0 !important;
    }
    .btn-content { display: flex; align-items: center; gap: 8px; }

    @media (max-width: 640px) {
      mat-dialog-content { min-width: auto; }
      .row-2, .row-3 { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductFormDialogComponent implements OnInit {
  private service = inject(ProductService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  data: ProductFormData = inject(MAT_DIALOG_DATA);

  categories = require('@angular/core').signal<Category[]>([]);
  saving = false;

  model: any = this.data.mode === 'create'
    ? {
        sku: '',
        name: '',
        description: '',
        categoryId: undefined,
        unitOfMeasure: 'EA',
        costPrice: 0,
        sellingPrice: 0,
        taxRatePercent: 18
      }
    : {
        name: this.data.product!.name,
        description: this.data.product!.description ?? '',
        categoryId: this.data.product!.categoryId,
        unitOfMeasure: this.data.product!.unitOfMeasure,
        costPrice: this.data.product!.costPrice,
        sellingPrice: this.data.product!.sellingPrice,
        taxRatePercent: this.data.product!.taxRate * 100,
        isActive: this.data.product!.isActive
      };

  ngOnInit(): void {
    this.service.getCategories().subscribe(cats => this.categories.set(cats));
  }

  marginPercent(): string {
    if (!this.model.costPrice || this.model.costPrice <= 0) return '0';
    return (((this.model.sellingPrice - this.model.costPrice) / this.model.costPrice) * 100).toFixed(1);
  }

  save(): void {
    this.saving = true;

    if (this.data.mode === 'create') {
      const request: CreateProductRequest = {
        sku: this.model.sku.trim(),
        name: this.model.name.trim(),
        description: this.model.description?.trim() || undefined,
        categoryId: this.model.categoryId,
        unitOfMeasure: this.model.unitOfMeasure,
        taxRate: Number(this.model.taxRatePercent) / 100,
        costPrice: Number(this.model.costPrice),
        sellingPrice: Number(this.model.sellingPrice)
      };
      this.service.create(request).subscribe({
        next: (p) => {
          this.snackBar.open(`Product "${p.name}" created`, 'Close', { duration: 3000 });
          this.dialogRef.close(p);
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err?.error?.message ?? 'Failed to create product', 'Close', { duration: 4000 });
        }
      });
    } else {
      const request: UpdateProductRequest = {
        name: this.model.name.trim(),
        description: this.model.description?.trim() || undefined,
        categoryId: this.model.categoryId,
        unitOfMeasure: this.model.unitOfMeasure,
        taxRate: Number(this.model.taxRatePercent) / 100,
        costPrice: Number(this.model.costPrice),
        sellingPrice: Number(this.model.sellingPrice),
        isActive: this.model.isActive
      };
      this.service.update(this.data.product!.id, request).subscribe({
        next: (p) => {
          this.snackBar.open(`Product "${p.name}" updated`, 'Close', { duration: 3000 });
          this.dialogRef.close(p);
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err?.error?.message ?? 'Failed to update product', 'Close', { duration: 4000 });
        }
      });
    }
  }

  cancel(): void { this.dialogRef.close(); }
}
