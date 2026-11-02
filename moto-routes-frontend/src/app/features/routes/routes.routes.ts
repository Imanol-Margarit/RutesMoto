import { Routes } from '@angular/router';
import { roleGuard } from '../../auth/role.guard';
import { WRITER_ROLES } from '../../auth/auth.models';

export const ROUTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/routes-list/routes-list').then((m) => m.RoutesList)
  },
  {
    path: 'create',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/route-create/route-create').then((m) => m.RouteCreate)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/route-edit/route-edit').then((m) => m.RouteEdit)
  }
];
