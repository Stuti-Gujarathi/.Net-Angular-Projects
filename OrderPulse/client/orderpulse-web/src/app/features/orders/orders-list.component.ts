import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <h1>Orders</h1>
    <mat-card>
      <mat-card-content>
        @if (loading()) {
          <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
        } @else if (orders().length === 0) {
          <p>No orders yet.</p>
        } @else {
          <table mat-table [dataSource]="orders()" class="full-width">
            <ng-container matColumnDef="number">
              <th mat-header-cell *matHeaderCellDef>Order #</th>
              <td mat-cell *matCellDef="let o">{{ o.orderNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let o">{{ o.status }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let o">₹{{ o.totalAmount }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    h1 { margin-top: 0; }
    .full-width { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 40px; }
  `]
})
export class OrdersListComponent implements OnInit {
  private service = inject(OrderService);
  cols = ['number', 'status', 'total'];
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: d => { this.orders.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
