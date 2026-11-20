export function notFoundHandler(_req, res) {
  return res.status(404).json({ success: false, message: "Endpoint no encontrado", errors: [] });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Error interno del gateway", errors: [] });
}
