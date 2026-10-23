import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { ApiErrorBody } from '../models/api.model';

/** Muestra un aviso con el error de la API y deja pasar el error a quien hizo la petición. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alert = inject(AlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error as Partial<ApiErrorBody> | null;
      const details = (body?.errors ?? []).map((item) => item.message).filter(Boolean);

      let message = 'Ha ocurrido un error inesperado.';
      if (error.status === 0) {
        message = 'No se puede conectar con el servidor. Comprueba tu conexión.';
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
