/** Rol de usuario tal como lo devuelve la API. */
export interface Role {
  _id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}
