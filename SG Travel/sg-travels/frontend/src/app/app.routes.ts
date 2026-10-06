import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'SG Travels: find your holiday by feeling',
    loadComponent: () => import('./pages/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'discover',
    title: 'Trips that match your feeling | SG Travels',
    loadComponent: () => import('./pages/discover/discover-page').then((m) => m.DiscoverPage),
  },
  {
    path: 'journeys/:slug',
    loadComponent: () => import('./pages/journey/journey-page').then((m) => m.JourneyPage),
  },
  {
    path: 'journeys/:slug/reserve',
    loadComponent: () => import('./pages/reserve/reserve-page').then((m) => m.ReservePage),
  },
  {
    path: '**',
    title: 'Page not found | SG Travels',
    loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
