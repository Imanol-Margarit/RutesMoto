import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { ApiErrorBody } from '../models/api.model';

/**
 * Muestra un aviso con el mensaje de la API.
 * Va POR FUERA de authInterceptor: solo ve el error final, después del intento de /refresh.
 * Los 401 de sesión los gestiona authInterceptor (refresh, limpiar store, ir a /login), así que aquí
 * solo se avisa del 401 de login/register (credenciales incorrectas).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alert = inject(AlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error as Partial<ApiErrorBody> | null;
      const details = (body?.errors ?? []).map((item) => item.message).filter(Boolean);
      const isCredentialsRequest = /\/auth\/(login|register)$/.test(req.url);

      if (error.status === 401 && !isCredentialsRequest) {
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
