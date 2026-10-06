import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CustomersListComponent } from './features/customers/customers-list.component';
import { ProductsListComponent } from './features/products/products-list.component';
import { OrdersListComponent } from './features/orders/orders-list.component';
import { ForbiddenComponent } from './features/forbidden.component';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'customers',
        component: CustomersListComponent,
        canActivate: [permissionGuard],
        data: { permission: 'Customers.View' }
      },
      {
        path: 'products',
        component: ProductsListComponent,
        canActivate: [permissionGuard],
        data: { permission: 'Products.View' }
      },
      {
        path: 'orders',
        component: OrdersListComponent,
        canActivate: [permissionGuard],
        data: { permission: 'Orders.View' }
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
