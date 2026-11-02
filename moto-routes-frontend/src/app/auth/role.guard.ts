import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AlertService } from '../core/services/alert.service';
import { AuthRole } from './auth.models';
import { AuthStore } from './auth.store';

/**
 * Guard de acción por rol. Uso en rutas: data: { roles: WRITER_ROLES }.
 * Si la ruta no define roles, cualquier usuario autenticado pasa.
 */
export const roleGuard: CanActivateFn = (route) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const alert = inject(AlertService);

  if (!store.isAuthenticated()) return router.createUrlTree(['/login']);

  const allowed = (route.data['roles'] ?? []) as AuthRole[];
  const role = store.role();

  if (allowed.length === 0 || (role !== null && allowed.includes(role))) return true;

  void alert.error('Acceso denegado', 'No tienes permiso para realizar esta acción.');
  return router.createUrlTree(['/routes']);
};
