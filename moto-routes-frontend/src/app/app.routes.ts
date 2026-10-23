import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'routes', pathMatch: 'full' },
      {
        path: 'routes',
        loadChildren: () => import('./features/routes/routes.routes').then((m) => m.ROUTES_ROUTES)
      },
      {
        path: 'departures',
        loadChildren: () => import('./features/departures/departures.routes').then((m) => m.DEPARTURES_ROUTES)
      },
      {
        path: 'hosts',
        loadChildren: () => import('./features/hosts/hosts.routes').then((m) => m.HOSTS_ROUTES)
      },
      {
        path: 'categories',
        loadChildren: () => import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES)
      },
      {
        path: 'locations',
        loadChildren: () => import('./features/locations/locations.routes').then((m) => m.LOCATIONS_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      },
      {
        path: 'roles',
        loadChildren: () => import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'routes' }
];
