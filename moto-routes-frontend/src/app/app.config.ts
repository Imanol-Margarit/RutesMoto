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
import { authInterceptor } from './auth/auth.interceptor';
import { AuthService } from './auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Antes de arrancar: /auth/me con la cookie. Si el access caducó, el interceptor hace /refresh.
    provideAppInitializer(() => inject(AuthService).me()),
    // Los parámetros de ruta (:id) llegan como input() de cada página.
    provideRouter(routes, withComponentInputBinding()),
    // El primero es el más externo. errorInterceptor va por fuera de authInterceptor
    // para avisar solo del error final (después del intento de /refresh).
    provideHttpClient(
      withInterceptors([requestInterceptor, loadingInterceptor, errorInterceptor, authInterceptor])
    )
  ]
};
