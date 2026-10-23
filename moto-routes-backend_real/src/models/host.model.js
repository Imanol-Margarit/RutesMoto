// Tabla: hosts. La API usa camelCase; la base de datos usa snake_case.
export const hostModel = {
  table: "hosts",
  columns: {
    userId: "user_id",
    name: "name",
    biography: "biography",
    slug: "slug",
    status: "status",
    isActive: "is_active"
  },
  numeric: []
};
