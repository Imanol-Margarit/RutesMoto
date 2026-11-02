import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { requestInterceptor } from './core/interceptors/request.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Restaura la sesión guardada y valida el token antes de arrancar la app.
    provideAppInitializer(() => inject(AuthService).restoreSession()),
    // Los parámetros de ruta (:id) llegan como input() de cada página.
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([requestInterceptor, loadingInterceptor, errorInterceptor])
    )
  ]
};
