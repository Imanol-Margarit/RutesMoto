import { pool } from "../config/db.js";
import { refreshTokenModel } from "../models/refresh-token.model.js";

const TABLE = refreshTokenModel.table;

export const refreshTokenRepository = {
  // Devuelve el id: el access token se enlaza a él.
  async create({ userId, tokenHash, expiresAt }, client = pool) {
    const { rows } = await client.query(
      `INSERT INTO ${TABLE} (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0].id;
  },

  // Devuelve el token aunque esté revocado o caducado: el servicio decide qué hacer.
  async findByHash(tokenHash, client = pool) {
    const { rows } = await client.query(
      `SELECT id AS "_id", user_id AS "userId", status, expires_at AS "expiresAt"
       FROM ${TABLE} WHERE token_hash = $1`,
      [tokenHash]
    );
    return rows[0] ?? null;
  },

  /**
   * Revoca un token solo si sigue activo. Devuelve true si lo ha revocado esta llamada:
   * así, si llegan dos /refresh a la vez con el mismo token, solo uno gana.
   */
  async revoke(id, client = pool) {
    const { rowCount } = await client.query(
      `UPDATE ${TABLE} SET status = 'revoked', revoked_at = NOW() WHERE id = $1 AND status = 'active'`,
      [id]
    );
    return rowCount > 0;
  },

  // Cierra todas las sesiones del usuario (reutilización de un token ya revocado).
  async revokeAllForUser(userId, client = pool) {
    await client.query(
      `UPDATE ${TABLE} SET status = 'revoked', revoked_at = NOW() WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );
  },

  // Limpieza: borra los tokens caducados del usuario al crear uno nuevo.
  async deleteExpiredForUser(userId, client = pool) {
    await client.query(`DELETE FROM ${TABLE} WHERE user_id = $1 AND expires_at <= NOW()`, [userId]);
  }
};
