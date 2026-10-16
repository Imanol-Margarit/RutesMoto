// Tabla: rutas_images. La API usa camelCase; la base de datos usa snake_case.
// isCover se guarda en la columna is_primary.
export const routeImageModel = {
  table: "rutas_images",
  foreignKey: "ruta_id",
  columns: {
    imageUrl: "image_url",
    altText: "alt_text",
    position: "sort_order",
    isCover: "is_primary"
  }
};
