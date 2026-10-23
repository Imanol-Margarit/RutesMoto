/**
 * Tablas de imágenes. Todas tienen la misma forma: una fila por imagen con la clave de su entidad,
 * URL, texto alternativo, orden y principal.
 */
export const imageModels = {
  route: { table: "rutas_images", foreignKey: "ruta_id", notFound: "Ruta no encontrada" },
  host: { table: "hosts_images", foreignKey: "host_id", notFound: "Guía no encontrado" },
  category: { table: "categories_images", foreignKey: "category_id", notFound: "Categoría no encontrada" },
  location: { table: "locations_images", foreignKey: "location_id", notFound: "Localización no encontrada" },
  user: { table: "users_images", foreignKey: "user_id", notFound: "Usuario no encontrado" }
};

// La API usa camelCase; la base de datos usa snake_case.
export const imageColumns = {
  imageUrl: "image_url",
  altText: "alt_text",
  position: "sort_order",
  isCover: "is_primary"
};
