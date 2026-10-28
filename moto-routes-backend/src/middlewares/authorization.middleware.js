import { AppError } from "../utils/app-error.js";

/** Solo deja pasar a los roles indicados. Debe ir después de authenticate. */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Authentication required", 401));

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("No tienes permiso para acceder a este recurso", 403));
    }

    return next();
  };
}

/** Lecturas: cualquier usuario autenticado. Escrituras (POST, PATCH, DELETE): solo admin. */
export function authorizeAdminForWrites(req, res, next) {
  if (req.method === "GET") return next();
  return authorizeRoles("admin")(req, res, next);
}
