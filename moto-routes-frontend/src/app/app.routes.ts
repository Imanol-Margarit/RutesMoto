import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { ShopLayout } from './layouts/shop-layout/shop-layout';
import { LoginPage } from './auth/login.page';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'shop', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  // ── Tienda pública: sin sesión ────────────────────────────────────────────
  {
    path: 'shop',
    component: ShopLayout,
    loadChildren: () => import('./features/shop/shop.routes').then((m) => m.SHOP_ROUTES)
  },
  // ── Panel: requiere sesión ────────────────────────────────────────────────
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES)
      },
      {
        path: 'routes',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/routes/routes.routes').then((m) => m.ROUTES_ROUTES)
      },
      {
        path: 'departures',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/departures/departures.routes').then((m) => m.DEPARTURES_ROUTES)
      },
      {
        path: 'hosts',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/hosts/hosts.routes').then((m) => m.HOSTS_ROUTES)
      },
      {
        path: 'categories',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES)
      },
      {
        path: 'locations',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/locations/locations.routes').then((m) => m.LOCATIONS_ROUTES)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      },
      {
        path: 'roles',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'shop' }
];
