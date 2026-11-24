import { createHash, randomBytes, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { AppError } from "./app-error.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Configuración JWT incompleta", 500);
  }
  return process.env.JWT_SECRET;
}

export const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "1h";
export const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS) || 7;
export const REFRESH_TOKEN_MAX_AGE_MS = REFRESH_TOKEN_DAYS * DAY_MS;

/**
 * Access token: JWT de 1 h con el id, email y rol del usuario.
 * jti aleatorio: sin él, dos logins en el mismo segundo darían el mismo JWT (y el mismo hash en la BD).
 */
export function createAccessToken({ sub, email, role }) {
  return jwt.sign({ sub, email, role, jti: randomUUID() }, getSecret(), { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

/** Fecha de caducidad de un JWT (para guardarla en la BD). */
export function tokenExpiresAt(token) {
  return new Date(jwt.decode(token).exp * 1000);
}

/** Comprueba la firma y la caducidad del access token y devuelve el payload. */
export function verifyAccessToken(token) {
  return jwt.verify(token, getSecret());
}

/** Milisegundos que le quedan a un JWT (para el maxAge de la cookie: caduca a la vez que el token). */
export function tokenMaxAgeMs(token) {
  const { exp } = jwt.decode(token);
  return Math.max(exp * 1000 - Date.now(), 0);
}

/** Refresh token: valor aleatorio opaco (no es un JWT). Solo se valida contra la base de datos. */
export function generateRefreshToken() {
  return randomBytes(64).toString("hex");
}

/** Hash SHA-256 del refresh token: es lo único que se guarda en la base de datos. */
export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiresAt() {
  return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
}
