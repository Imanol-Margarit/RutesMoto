/** Rol tal como la devuelve la API (camelCase). */
export interface Role {
  _id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Campos que acepta la API. isActive solo se envía al editar. */
export interface RolePayload {
  name: string;
  description: string | null;
  isActive?: boolean;
}
