import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/users-list/users-list').then((m) => m.UsersList)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/user-create/user-create').then((m) => m.UserCreate)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/user-edit/user-edit').then((m) => m.UserEdit)
  }
];
