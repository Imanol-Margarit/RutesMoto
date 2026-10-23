// Tabla: roles. La API usa camelCase; la base de datos usa snake_case.
export const roleModel = {
  table: "roles",
  columns: {
    name: "name",
    slug: "slug",
    description: "description",
    isActive: "is_active"
  },
  numeric: []
};
