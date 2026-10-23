// Mensajes para las restricciones de la base de datos, según su nombre.
const CONSTRAINT_MESSAGES = {
  roles_name_key: "Ya existe un rol con ese nombre",
  users_email_key: "Ya existe un usuario con ese email",
  "hosts_userId_key": "Ese usuario ya tiene un perfil de guía",
  hosts_slug_key: "Ya existe un guía con ese nombre",
  categories_name_key: "Ya existe una categoría con ese nombre",
  categories_slug_key: "Ya existe una categoría con ese nombre",
  locations_slug_key: "Ya existe una localización con esa ciudad y país",
  rutas_slug_key: "Ya existe una ruta con ese título",
  departures_slug_key: "Ya existe una salida con esos datos",
  departures_dates_check: "La fecha de fin debe ser posterior a la de inicio",
  departures_booked_check: "Las plazas reservadas no pueden superar la capacidad"
};

/** Traduce los errores de PostgreSQL a respuestas HTTP en español. */
function mapDatabaseError(error) {
  switch (error.code) {
    case "23505": // unique_violation
      return { status: 409, message: CONSTRAINT_MESSAGES[error.constraint] ?? "Ya existe un registro con esos datos" };
    case "23503": // foreign_key_violation
      return (error.detail ?? "").includes("is not present in table")
        ? { status: 400, message: "Alguna de las referencias indicadas no existe" }
        : { status: 409, message: "No se puede completar la operación porque hay registros relacionados" };
    case "23502": // not_null_violation
      return { status: 400, message: "Falta un campo obligatorio" };
    case "23514": // check_violation
      return { status: 400, message: CONSTRAINT_MESSAGES[error.constraint] ?? "Los datos no cumplen una regla de la base de datos" };
    case "22P02": // invalid_text_representation
    case "22007": // invalid_datetime_format
    case "22008": // datetime_field_overflow
      return { status: 400, message: "Alguno de los valores tiene un formato no válido" };
    default:
      return null;
  }
}

export function notFoundHandler(_req, res) {
  return res.status(404).json({
    success: false,
    message: "Endpoint no encontrado",
    errors: []
  });
}

export function errorHandler(error, _req, res, _next) {
  // JSON mal formado en el body (lo lanza express.json antes de llegar a los handlers).
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "El cuerpo de la petición no es un JSON válido",
      errors: []
    });
  }

  let statusCode = error.statusCode || 500;
  let message;
  let details = error.details || [];

  if (error.isOperational) {
    // Error nuestro (AppError): su mensaje ya está en español.
    message = error.message;
  } else {
    const mapped = mapDatabaseError(error);
    if (mapped) {
      statusCode = mapped.status;
      message = mapped.message;
      details = [];
    } else {
      statusCode = 500;
      message = "Error interno del servidor";
    }
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({ success: false, message, errors: details });
}
