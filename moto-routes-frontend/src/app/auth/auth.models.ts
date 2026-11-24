/** Roles del backend. host se comporta como admin en las escrituras. */
export type AuthRole = 'admin' | 'host' | 'user';

/** Roles que pueden entrar al panel: crear, editar y gestionar usuarios. */
export const WRITER_ROLES: AuthRole[] = ['admin', 'host'];

export interface AuthUser {
  _id: string;
  email: string;
  role: AuthRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Lo que devuelven login, register, refresh y me.
 * Los tokens nunca llegan al frontend: viajan solo en cookies HttpOnly.
 */
export interface AuthUserResponse {
  user: AuthUser;
}
