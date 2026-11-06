import { Injectable, computed, signal } from '@angular/core';
import { AuthRole, AuthUser, WRITER_ROLES } from './auth.models';

export interface AuthSessionData {
  token: string;
  user: AuthUser;
}

/**
 * Estado de sesión en memoria (signals). El token no se guarda en localStorage:
 * la cookie HttpOnly mantiene la sesión entre recargas, y al arrancar se pide el token a /auth/session.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(null);
  private readonly _user = signal<AuthUser | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly role = computed<AuthRole | null>(() => this._user()?.role ?? null);
  readonly isAuthenticated = computed(() => Boolean(this._token()) && Boolean(this._user()));
  readonly canWrite = computed(() => {
    const role = this.role();
    return role !== null && WRITER_ROLES.includes(role);
  });

  /** Guarda token y usuario que devuelve el servidor. */
  setSession(session: AuthSessionData): void {
    this._token.set(session.token);
    this._user.set(session.user);
  }

  /** Pone el token y el usuario a null. */
  logout(): void {
    this._token.set(null);
    this._user.set(null);
  }

  /** Cambia solo algunos campos del usuario (nombre, avatar...). */
  updateUser(patch: Partial<AuthUser>): void {
    const current = this._user();
    if (!current) return;
    this._user.set({ ...current, ...patch });
  }
}
