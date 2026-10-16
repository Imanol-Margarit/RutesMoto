// Tabla: rutas. La API usa camelCase; la base de datos usa snake_case.
export const routeModel = {
  table: "rutas",
  columns: {
    title: "title",
    distanceKm: "distance_km",
    difficulty: "difficulty",
    description: "description",
    slug: "slug",
    surface: "surface",
    startPoint: "start_point",
    estimatedMinutes: "estimated_minutes",
    status: "status",
    isActive: "is_active",
    hostId: "host_id",
    categoryId: "category_id",
    locationId: "location_id"
  },
  numeric: ["distanceKm"],
  // Imágenes: tabla rutas_images (ruta_id). Pendiente de endpoints.
  images: { table: "rutas_images", foreignKey: "ruta_id" }
};
