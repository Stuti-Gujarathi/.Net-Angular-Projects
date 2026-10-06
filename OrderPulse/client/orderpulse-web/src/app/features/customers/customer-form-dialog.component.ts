import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../core/services/customer.service';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../../core/models/customer.model';

export interface CustomerFormData {
  customer?: Customer;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-customer-form-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSlideToggleModule
  ],
  template: `
    <div class="dialog-header">
      <div class="header-icon" [class.edit]="data.mode === 'edit'">
        <mat-icon>{{ data.mode === 'create' ? 'add_business' : 'edit' }}</mat-icon>
      </div>
      <div>
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Customer' : 'Edit Customer' }}</h2>
        <p class="subtitle">
          {{ data.mode === 'create' ? 'Add a new customer to your distribution network' : 'Update customer details' }}
        </p>
      </div>
    </div>

    <mat-dialog-content>
      <form #form="ngForm" class="customer-form">
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Customer Code</mat-label>
            <input matInput [(ngModel)]="model.customerCode" name="customerCode" required
                   placeholder="e.g. HILLTOP-01" autocomplete="off">
            <mat-icon matSuffix>qr_code</mat-icon>
            <mat-hint>Unique identifier — letters, numbers and dashes only</mat-hint>
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Customer Name</mat-label>
          <input matInput [(ngModel)]="model.name" name="name" required
                 placeholder="e.g. Hilltop Market" autocomplete="off">
          <mat-icon matSuffix>store</mat-icon>
        </mat-form-field>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput [(ngModel)]="model.phone" name="phone" placeholder="+91-9876543210" autocomplete="off">
            <mat-icon matSuffix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="model.email" name="email" placeholder="contact@example.com" autocomplete="off">
            <mat-icon matSuffix>email</mat-icon>
          </mat-form-field>
        </div>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Credit Limit (₹)</mat-label>
            <input matInput type="number" [(ngModel)]="model.creditLimit" name="creditLimit" required min="0">
            <mat-icon matSuffix>account_balance_wallet</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payment Terms (days)</mat-label>
            <input matInput type="number" [(ngModel)]="model.paymentTermsDays" name="paymentTermsDays" required min="0" max="365">
            <mat-icon matSuffix>calendar_today</mat-icon>
          </mat-form-field>
        </div>

        @if (data.mode === 'edit') {
          <div class="toggle-row">
            <mat-slide-toggle [(ngModel)]="model.isActive" name="isActive" color="primary">
              Active Customer
            </mat-slide-toggle>
            <span class="toggle-hint">Inactive customers cannot place new orders</span>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" [disabled]="saving">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!form.valid || saving">
        @if (saving) {
          <span class="btn-content">Saving...</span>
        } @else {
          <span class="btn-content">
            <mat-icon>{{ data.mode === 'create' ? 'check' : 'save' }}</mat-icon>
            {{ data.mode === 'create' ? 'Create Customer' : 'Save Changes' }}
          </span>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      padding: 24px 24px 8px;
    }
    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
    .header-icon.edit {
      background: linear-gradient(135deg, #f59e0b, #f97316);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
    }
    .header-icon mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }

    h2[mat-dialog-title] {
      margin: 0 !important;
      font-size: 22px;
      font-weight: 700;
      color: var(--op-text-primary);
      padding: 0 !important;
    }
    .subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      color: var(--op-text-secondary);
    }

    mat-dialog-content {
      padding: 16px 24px !important;
      min-width: 560px;
    }

    .customer-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .full-width { width: 100%; }

    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .toggle-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 0;
    }
    .toggle-hint {
      font-size: 12px;
      color: var(--op-text-muted);
      padding-left: 48px;
    }

    mat-dialog-actions {
      padding: 16px 24px !important;
      border-top: 1px solid var(--op-border);
      margin: 0 !important;
    }

    .btn-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 640px) {
      mat-dialog-content { min-width: auto; }
      .row-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class CustomerFormDialogComponent {
  private service = inject(CustomerService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CustomerFormDialogComponent>);
  data: CustomerFormData = inject(MAT_DIALOG_DATA);

  saving = false;

  model: any = this.data.mode === 'create'
    ? {
        customerCode: '',
        name: '',
        phone: '',
        email: '',
        creditLimit: 0,
        paymentTermsDays: 30
      }
    : {
        name: this.data.customer!.name,
        phone: this.data.customer!.phone ?? '',
        email: this.data.customer!.email ?? '',
        creditLimit: this.data.customer!.creditLimit,
        paymentTermsDays: this.data.customer!.paymentTermsDays,
        isActive: this.data.customer!.isActive
      };

  save(): void {
    this.saving = true;

    if (this.data.mode === 'create') {
      const request: CreateCustomerRequest = {
        customerCode: this.model.customerCode.trim(),
        name: this.model.name.trim(),
        phone: this.model.phone?.trim() || undefined,
        email: this.model.email?.trim() || undefined,
        creditLimit: Number(this.model.creditLimit),
        paymentTermsDays: Number(this.model.paymentTermsDays)
      };
      this.service.create(request).subscribe({
        next: (c) => {
          this.snackBar.open(`Customer "${c.name}" created successfully`, 'Close', { duration: 3000 });
          this.dialogRef.close(c);
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err?.error?.message ?? 'Failed to create customer', 'Close', { duration: 4000 });
        }
      });
    } else {
      const request: UpdateCustomerRequest = {
        name: this.model.name.trim(),
        phone: this.model.phone?.trim() || undefined,
        email: this.model.email?.trim() || undefined,
        creditLimit: Number(this.model.creditLimit),
        paymentTermsDays: Number(this.model.paymentTermsDays),
        isActive: this.model.isActive
      };
      this.service.update(this.data.customer!.id, request).subscribe({
        next: (c) => {
          this.snackBar.open(`Customer "${c.name}" updated`, 'Close', { duration: 3000 });
          this.dialogRef.close(c);
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err?.error?.message ?? 'Failed to update customer', 'Close', { duration: 4000 });
        }
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
