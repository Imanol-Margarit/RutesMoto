import { Routes } from '@angular/router';

export const ROUTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/routes-list/routes-list').then((m) => m.RoutesList)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/route-create/route-create').then((m) => m.RouteCreate)
  },
  {
    path: ':slug/edit',
    loadComponent: () => import('./pages/route-edit/route-edit').then((m) => m.RouteEdit)
  },
  {
    path: ':slug',
    loadComponent: () => import('./pages/route-detail/route-detail').then((m) => m.RouteDetail)
  }
];
