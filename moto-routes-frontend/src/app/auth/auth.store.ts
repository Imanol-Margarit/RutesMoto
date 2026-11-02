import { Injectable, computed, signal } from '@angular/core';
import { AuthRole, AuthUser, WRITER_ROLES } from './auth.models';

/**
 * Estado de sesión (signals). El token vive en una cookie HttpOnly que JavaScript no puede leer:
 * aquí solo se guarda el usuario en memoria. Al recargar, la sesión se recupera con GET /api/profile.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<AuthUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly role = computed<AuthRole | null>(() => this._user()?.role ?? null);
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly canWrite = computed(() => {
    const role = this.role();
    return role !== null && WRITER_ROLES.includes(role);
  });

  login(user: AuthUser): void {
    this._user.set(user);
  }

  logout(): void {
    this._user.set(null);
  }

  updateUser(patch: Partial<AuthUser>): void {
    const current = this._user();
    if (!current) return;
    this._user.set({ ...current, ...patch });
  }
}