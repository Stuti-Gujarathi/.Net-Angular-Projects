import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>403 — Access Denied</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>You don't have permission to view this page.</p>
          <button mat-raised-button color="primary" routerLink="/dashboard">Back to Dashboard</button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    mat-card { width: 400px; padding: 20px; text-align: center; }
  `]
})
export class ForbiddenComponent {}
