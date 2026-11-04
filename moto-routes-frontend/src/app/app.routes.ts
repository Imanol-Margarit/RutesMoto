import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { LoginPage } from './auth/login.page';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { WRITER_ROLES } from './auth/auth.models';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'routes', pathMatch: 'full' },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES)
      },
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
        canActivate: [roleGuard],
        data: { roles: WRITER_ROLES },
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      },
      {
        path: 'roles',
        canActivate: [roleGuard],
        data: { roles: WRITER_ROLES },
        loadChildren: () => import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'routes' }
];
