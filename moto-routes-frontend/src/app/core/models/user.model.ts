/** Usuario tal como lo devuelve la API. Nunca incluye la contraseña. */
export interface User {
  _id: string;
  roleId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Campos que acepta la API. password es obligatoria al crear y opcional al editar. */
export interface UserPayload {
  roleId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  avatarUrl: string | null;
  isActive?: boolean;
}
