import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { ApiResponse } from '../core/models/api.model';
import { AuthUser, LoginRequest, LoginResponseData } from './auth.models';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly store = inject(AuthStore);

  /** El servidor fija la cookie access_token. Aquí solo guardamos el usuario que devuelve. */
  async login(credentials: LoginRequest): Promise<void> {
    const response = await this.api.post<ApiResponse<LoginResponseData>>('auth/login', credentials);
    this.store.login(response.data.user);
    await this.restoreSession();
  }

  /** El servidor revoca el token y borra la cookie. Aunque falle la petición, se limpia la sesión local. */
  async logout(): Promise<void> {
    try {
      await this.api.post<ApiResponse<null>>('auth/logout', {});
    } catch {
      // Si la sesión ya había caducado, no hay nada que revocar.
    } finally {
      this.store.logout();
    }
  }

  /**
   * Al arrancar la app no hay token que leer: preguntamos al servidor con la cookie.
   * Si responde 401, no hay sesión.
   */
  async restoreSession(): Promise<void> {
    try {
      const response = await this.api.get<ApiResponse<{ user: AuthUser }>>('auth/me');
      this.store.login(response.data.user);
    } catch {
      this.store.logout();
    }
  }
}