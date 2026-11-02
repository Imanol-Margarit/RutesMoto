import { Routes } from '@angular/router';
import { roleGuard } from '../../auth/role.guard';
import { WRITER_ROLES } from '../../auth/auth.models';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/categories-list/categories-list').then((m) => m.CategoriesList)
  },
  {
    path: 'create',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/category-create/category-create').then((m) => m.CategoryCreate)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: WRITER_ROLES },
    loadComponent: () => import('./pages/category-edit/category-edit').then((m) => m.CategoryEdit)
  }
];
