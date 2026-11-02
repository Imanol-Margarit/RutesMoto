import { Routes } from '@angular/router';
import { roleGuard } from '../../auth/role.guard';
import { WRITER_ROLES } from '../../auth/auth.models';

export const DEPARTURES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/departures-list/departures-list').then((m) => m.DeparturesList)
  },
  {
    path: 'create',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/departure-create/departure-create').then((m) => m.DepartureCreate)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/departure-edit/departure-edit').then((m) => m.DepartureEdit)
  }
];
