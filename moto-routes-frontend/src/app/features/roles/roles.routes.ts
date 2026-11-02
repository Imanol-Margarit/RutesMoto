import { Routes } from '@angular/router';
import { roleGuard } from '../../auth/role.guard';
import { WRITER_ROLES } from '../../auth/auth.models';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/roles-list/roles-list').then((m) => m.RolesList)
  },
  {
    path: 'create',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/role-create/role-create').then((m) => m.RoleCreate)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/role-edit/role-edit').then((m) => m.RoleEdit)
  }
];
