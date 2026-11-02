import { Routes } from '@angular/router';
import { roleGuard } from '../../auth/role.guard';
import { WRITER_ROLES } from '../../auth/auth.models';

export const HOSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/hosts-list/hosts-list').then((m) => m.HostsList)
  },
  {
    path: 'create',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/host-create/host-create').then((m) => m.HostCreate)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/host-edit/host-edit').then((m) => m.HostEdit)
  }
];
