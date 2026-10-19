import { Routes } from '@angular/router';

export const DEPARTURES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/departures-list/departures-list').then((m) => m.DeparturesList)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/departure-create/departure-create').then((m) => m.DepartureCreate)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/departure-edit/departure-edit').then((m) => m.DepartureEdit)
  }
];
