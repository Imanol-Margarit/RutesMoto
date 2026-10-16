export function respond(res, status, message, data) {
  return res.status(status).json({ success: true, message, data });
}
