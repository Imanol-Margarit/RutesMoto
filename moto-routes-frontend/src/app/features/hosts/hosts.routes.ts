import { Routes } from '@angular/router';

export const HOSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/hosts-list/hosts-list').then((m) => m.HostsList)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/host-create/host-create').then((m) => m.HostCreate)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/host-edit/host-edit').then((m) => m.HostEdit)
  }
];
