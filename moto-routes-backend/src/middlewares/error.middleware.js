export function notFoundHandler(_req, res) {
  return res.status(404).json({
    success: false,
    message: "Endpoint no encontrado",
    errors: []
  });
}

export function errorHandler(error, _req, res, _next) {
  // JSON mal formado en el body (lo lanza express.json antes de llegar a nuestros controllers).
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "El cuerpo de la petición no es un JSON válido",
      errors: []
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  // Solo mostramos el mensaje original si es un error nuestro (AppError). Los errores
  // inesperados (p. ej. de PostgreSQL) llegarían en inglés y con detalles internos.
  const message = error.isOperational ? error.message : "Error interno del servidor";

  return res.status(statusCode).json({
    success: false,
    message,
    errors: error.details || []
  });
}
