import { Injectable, inject } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { ApiResponse } from '../core/models/api.model';
import { AuthUser, LoginRequest, LoginResponseData } from './auth.models';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly store = inject(AuthStore);

  /** El servidor fija la cookie HttpOnly y devuelve el token, que se guarda en el store. */
  async login(credentials: LoginRequest): Promise<void> {
    const response = await this.api.post<ApiResponse<LoginResponseData>>('auth/login', credentials);
    this.store.setSession({ token: response.data.token, user: response.data.user });
  }

  /** El servidor revoca el token y borra la cookie. Aunque la petición falle, el store se limpia. */
  async logout(): Promise<void> {
    try {
      await this.api.post<ApiResponse<null>>('auth/logout', {});
    } catch {
      // Si el token ya había caducado, no hay nada que revocar.
    } finally {
      this.store.logout();
    }
  }

  /**
   * Al arrancar o recargar: el navegador envía la cookie sola y el servidor devuelve
   * el token y el usuario. Si no hay sesión válida (401), el store queda en null.
   */
  async restoreSession(): Promise<void> {
    try {
      const response = await this.api.get<ApiResponse<{ token: string; user: AuthUser }>>('auth/session');
      this.store.setSession({ token: response.data.token, user: response.data.user });
    } catch {
      this.store.logout();
    }
  }
}
