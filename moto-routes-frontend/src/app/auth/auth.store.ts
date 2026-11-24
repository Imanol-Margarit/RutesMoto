import { Injectable, computed, signal } from '@angular/core';
import { AuthRole, AuthUser, WRITER_ROLES } from './auth.models';

/**
 * Estado de sesión en memoria (signals). Solo guarda el usuario: los tokens están en
 * cookies HttpOnly que JavaScript no puede leer. Las llamadas HTTP las hace AuthService.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<AuthUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly role = computed<AuthRole | null>(() => this._user()?.role ?? null);
  readonly isAuthenticated = computed(() => this._user() !== null);
  /** admin y host: acceso al panel. */
  readonly isAdmin = computed(() => {
    const role = this.role();
    return role !== null && WRITER_ROLES.includes(role);
  });
  /** Alias de isAdmin que usan los listados del panel para mostrar los botones de edición. */
  readonly canWrite = this.isAdmin;

  setUser(user: AuthUser): void {
    this._user.set(user);
  }

  clear(): void {
    this._user.set(null);
  }

  /** Cambia solo algunos campos del usuario (nombre, avatar...). */
  updateUser(patch: Partial<AuthUser>): void {
    const current = this._user();
    if (!current) return;
    this._user.set({ ...current, ...patch });
  }
}
