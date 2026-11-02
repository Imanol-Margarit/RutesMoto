import { Routes } from '@angular/router';
import { roleGuard } from '../../auth/role.guard';
import { WRITER_ROLES } from '../../auth/auth.models';

export const LOCATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/locations-list/locations-list').then((m) => m.LocationsList)
  },
  {
    path: 'create',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/location-create/location-create').then((m) => m.LocationCreate)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/location-edit/location-edit').then((m) => m.LocationEdit)
  }
];
