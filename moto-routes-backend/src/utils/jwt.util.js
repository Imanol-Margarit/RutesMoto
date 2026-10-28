import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { AppError } from "./app-error.js";

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Configuración JWT incompleta", 500);
  }
  return process.env.JWT_SECRET;
}

/** create_token: firma un token con email, rol e identificador de usuario. */
export function createToken({ sub, email, role }) {
  return jwt.sign({ sub, email, role, jti: randomUUID() }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  });
}

/** verify_token: comprueba la firma y la caducidad, y devuelve el payload. */
export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}
