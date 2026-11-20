export function notFoundHandler(_req, res) {
  return res.status(404).json({ success: false, message: "Endpoint no encontrado", errors: [] });
}

export function errorHandler(error, _req, res, _next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "El cuerpo de la petición no es un JSON válido", errors: [] });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "La conversación es demasiado larga", errors: [] });
  }

  const statusCode = error.isOperational ? error.statusCode : 500;
  const message = error.isOperational ? error.message : "Error interno del servidor";

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({ success: false, message, errors: error.details || [] });
}
