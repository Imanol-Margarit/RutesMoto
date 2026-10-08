import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // El backend responde { success: false, message, errors: [{ field, message }] }.
      const apiMessage: string | undefined = error.error?.message;
      const details: string[] = Array.isArray(error.error?.errors)
        ? error.error.errors
            .map((item: { message?: string }) => item.message)
            .filter((text: string | undefined): text is string => !!text)
        : [];

      let message = 'Ha ocurrido un error inesperado.';

      if ((error as { name?: string }).name === 'TimeoutError' || error.status === 0) {
        message = 'No se puede conectar con el servidor. Comprueba tu conexión.';
      } else if (error.status === 404) {
        message = apiMessage || 'Recurso no encontrado.';
      } else if (error.status === 400 || error.status === 422) {
        // Si hay detalle por campo (validación), lo mostramos; si no, el mensaje general.
        message = details.length > 0 ? details.join(' · ') : apiMessage || 'Solicitud no válida.';
      } else if (error.status === 409) {
        message = apiMessage || 'Conflicto: ya existe un registro con ese valor.';
      } else if (error.status >= 500) {
        message = 'Error del servidor. Inténtalo de nuevo más tarde.';
      } else if (apiMessage) {
        message = apiMessage;
      }

      alertService.error('No se pudo completar la acción', message);

      return throwError(() => error);
    })
  );
};
