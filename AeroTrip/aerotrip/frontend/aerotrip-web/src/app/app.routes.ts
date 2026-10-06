import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  { path: '', title: 'AeroTrip — Compare and book flights', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
  { path: 'flights', title: 'Flights — AeroTrip', loadComponent: () => import('./pages/flights/flight-results.component').then((m) => m.FlightResultsComponent) },

  { path: 'login', title: 'Log in — AeroTrip', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/login.component').then((m) => m.LoginComponent) },
  { path: 'register', title: 'Create account — AeroTrip', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/register.component').then((m) => m.RegisterComponent) },

  // Booking flow: guests can search freely, but "Book now" lands here and the guard sends them to log in first.
  { path: 'booking/:itineraryId', title: 'Review your trip — AeroTrip', canActivate: [authGuard], loadComponent: () => import('./pages/booking/booking.component').then((m) => m.BookingComponent) },
  { path: 'payment/:bookingId', title: 'Payment — AeroTrip', canActivate: [authGuard], loadComponent: () => import('./pages/booking/payment.component').then((m) => m.PaymentComponent) },
  { path: 'trips/:bookingId', title: 'Your ticket — AeroTrip', canActivate: [authGuard], loadComponent: () => import('./pages/booking/ticket.component').then((m) => m.TicketComponent) },

  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account-layout.component').then((m) => m.AccountLayoutComponent),
    children: [
      { path: '', title: 'Dashboard — AeroTrip', loadComponent: () => import('./pages/account/account-overview.component').then((m) => m.AccountOverviewComponent) },
      { path: 'trips', title: 'My trips — AeroTrip', loadComponent: () => import('./pages/account/my-trips.component').then((m) => m.MyTripsComponent) },
      { path: 'profile', title: 'Profile — AeroTrip', loadComponent: () => import('./pages/account/profile.component').then((m) => m.ProfileComponent) },
    ],
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', title: 'Admin overview — AeroTrip', loadComponent: () => import('./pages/admin/admin-overview.component').then((m) => m.AdminOverviewComponent) },
      { path: 'bookings', title: 'Bookings — AeroTrip Admin', loadComponent: () => import('./pages/admin/admin-bookings.component').then((m) => m.AdminBookingsComponent) },
      { path: 'flights', title: 'Flights — AeroTrip Admin', loadComponent: () => import('./pages/admin/admin-flights.component').then((m) => m.AdminFlightsComponent) },
      { path: 'offers', title: 'Offers — AeroTrip Admin', loadComponent: () => import('./pages/admin/admin-offers.component').then((m) => m.AdminOffersComponent) },
      { path: 'users', title: 'Users — AeroTrip Admin', loadComponent: () => import('./pages/admin/admin-users.component').then((m) => m.AdminUsersComponent) },
    ],
  },

  { path: '**', title: 'Page not found — AeroTrip', loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent) },
];
