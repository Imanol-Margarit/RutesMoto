/** Imagen de una entidad (ruta, guía, categoría, localización o usuario). */
export interface EntityImage {
  _id: string;
  parentId: string;
  imageUrl: string;
  altText: string | null;
  position: number;
  isCover: boolean;
  createdAt: string;
}

export interface EntityImagePayload {
  imageUrl: string;
  altText?: string | null;
  position?: number;
  isCover?: boolean;
}
