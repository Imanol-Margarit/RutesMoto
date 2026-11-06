import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AlertService } from '../core/services/alert.service';
import { AuthStore } from './auth.store';

/**
 * Protege las secciones del panel: solo admin y host (host actúa como admin).
 * Sin sesión, lleva a /login. Con sesión de user, lleva a su perfil.
 */
export const adminGuard: CanActivateFn = (_, state) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const alert = inject(AlertService);

  if (!store.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  if (store.canWrite()) return true;

  void alert.error('Acceso denegado', 'Esta sección es solo para administradores.');
  return router.createUrlTree(['/profile']);
};
