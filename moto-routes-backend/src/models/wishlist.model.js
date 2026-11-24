// Tabla: wishlists. Tabla intermedia N:M: un usuario (user_id -> userId) guarda rutas (ruta_id -> routeId).
export const wishlistModel = {
  table: "wishlists",
  columns: {
    id: "id",
    userId: "user_id",
    routeId: "ruta_id"
  }
};
