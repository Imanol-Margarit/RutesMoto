import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { ApiErrorBody } from '../models/api.model';
import { AuthStore } from '../../auth/auth.store';

/**
 * 401: sesión inválida o caducada -> se cierra sesión y se va a /login.
 * 403: sin permiso para esa acción -> aviso.
 * Los demás errores muestran un aviso con el mensaje de la API.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alert = inject(AlertService);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error as Partial<ApiErrorBody> | null;
      const details = (body?.errors ?? []).map((item) => item.message).filter(Boolean);
      const isLoginRequest = req.url.endsWith('/auth/login');

      if (error.status === 401 && !isLoginRequest) {
        authStore.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        void alert.error('Sesión caducada', 'Vuelve a iniciar sesión para continuar.');
        return throwError(() => error);
      }

      let message = 'Ha ocurrido un error inesperado.';
      if (error.status === 0) {
        message = 'No se puede conectar con el servidor. Comprueba tu conexión.';
      } else if (error.status === 401) {
        message = body?.message ?? 'Email o contraseña incorrectos.';
      } else if (error.status === 403) {
        message = body?.message ?? 'No tienes permiso para realizar esta acción.';
      } else if (error.status === 400) {
        message = details.length > 0 ? details.join(' · ') : body?.message ?? 'Solicitud no válida.';
      } else if (error.status === 404) {
        message = body?.message ?? 'Recurso no encontrado.';
      } else if (error.status === 409) {
        message = body?.message ?? 'Ya existe un registro con esos datos.';
      } else if (error.status >= 500) {
        message = 'Error del servidor. Inténtalo de nuevo más tarde.';
      }

      void alert.error('No se pudo completar la acción', message);
      return throwError(() => error);
    })
  );
};
