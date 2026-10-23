// Tabla: categories. La API usa camelCase; la base de datos usa snake_case.
export const categoryModel = {
  table: "categories",
  columns: {
    name: "name",
    slug: "slug",
    description: "description",
    isActive: "is_active"
  },
  numeric: []
};
