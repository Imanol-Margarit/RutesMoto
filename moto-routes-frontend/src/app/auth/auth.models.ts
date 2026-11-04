/** Roles del backend. host se comporta como admin en las escrituras. */
export type AuthRole = 'admin' | 'host' | 'user';

/** Roles que pueden crear, editar y gestionar usuarios. */
export const WRITER_ROLES: AuthRole[] = ['admin', 'host'];

export interface AuthUser {
  _id: string;
  email: string;
  role: AuthRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Datos que devuelve POST /api/auth/login. */
export interface LoginResponseData {
  token: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
}
