// Tabla: users. La API usa camelCase; la base de datos usa snake_case.
// passwordHash nunca se devuelve al cliente (hidden).
export const userModel = {
  table: "users",
  columns: {
    roleId: "role_id",
    firstName: "first_name",
    lastName: "last_name",
    email: "email",
    passwordHash: "password_hash",
    avatarUrl: "avatar_url",
    isActive: "is_active"
  },
  hidden: ["passwordHash"],
  numeric: []
};
