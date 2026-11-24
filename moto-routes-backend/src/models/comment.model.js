// Tabla: comments. Pertenece a una ruta (ruta_id -> routeId) y a un usuario (user_id -> userId).
export const commentModel = {
  table: "comments",
  columns: {
    id: "id",
    routeId: "ruta_id",
    userId: "user_id",
    rating: "rating",
    content: "content",
    isActive: "is_active"
  }
};
