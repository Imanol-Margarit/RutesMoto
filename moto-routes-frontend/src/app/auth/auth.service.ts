import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { ApiResponse } from '../core/models/api.model';
import { AuthUserResponse, LoginRequest, RegisterRequest } from './auth.models';
import { AuthStore } from './auth.store';

/**
 * Llamadas a /api/auth. ApiService usa withCredentials: true, así el navegador
 * envía y recibe las cookies HttpOnly (access_token y refresh_token) por su cuenta.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly store = inject(AuthStore);

  async login(credentials: LoginRequest): Promise<void> {
    const response = await this.api.post<ApiResponse<AuthUserResponse>>('auth/login', credentials);
    this.store.setUser(response.data.user);
  }

  /** Crea una cuenta de cliente. El servidor deja la sesión iniciada. */
  async register(data: RegisterRequest): Promise<void> {
    const response = await this.api.post<ApiResponse<AuthUserResponse>>('auth/register', data);
    this.store.setUser(response.data.user);
  }

  /** El servidor revoca el refresh y borra las cookies. Aunque la petición falle, el store se limpia. */
  async logout(): Promise<void> {
    try {
      await this.api.post<ApiResponse<null>>('auth/logout', {});
    } catch {
      // Sin conexión o sin sesión: no hay nada más que hacer en el servidor.
    } finally {
      this.store.clear();
    }
  }

  /**
   * Al arrancar o recargar: pide el usuario a /me. Si el access ha caducado,
   * el interceptor lo renueva con /refresh y repite la petición. Si no hay sesión, el store queda vacío.
   */
  async me(): Promise<void> {
    try {
      const response = await this.api.get<ApiResponse<AuthUserResponse>>('auth/me');
      this.store.setUser(response.data.user);
    } catch {
      this.store.clear();
    }
  }
}
