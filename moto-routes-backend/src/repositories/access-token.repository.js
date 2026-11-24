import { pool } from "../config/db.js";
import { accessTokenModel } from "../models/access-token.model.js";

const TABLE = accessTokenModel.table;

export const accessTokenRepository = {
  async create({ userId, refreshTokenId, tokenHash, expiresAt }, client = pool) {
    await client.query(
      `INSERT INTO ${TABLE} (user_id, refresh_token_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)`,
      [userId, refreshTokenId, tokenHash, expiresAt]
    );
  },

  /**
   * Para el middleware: en UNA consulta comprueba que el token esté activo y sin caducar,
   * y trae el usuario con el nombre de su rol (solo roles activos y no borrados).
   */
  async findActiveWithUser(tokenHash) {
    const { rows } = await pool.query(
      `SELECT u.id AS "_id", u.email, u.is_active AS "isActive", r.name AS "role"
       FROM ${TABLE} AS a
       JOIN users AS u ON u.id = a.user_id AND u.deleted_at IS NULL
       JOIN roles AS r ON r.id = u.role_id AND r.deleted_at IS NULL AND r.is_active
       WHERE a.token_hash = $1 AND a.status = 'active' AND a.expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] ?? null;
  },

  // Revoca el access que generó un refresh (logout y rotación).
  async revokeByRefreshId(refreshTokenId, client = pool) {
    await client.query(
      `UPDATE ${TABLE} SET status = 'revoked', revoked_at = NOW() WHERE refresh_token_id = $1 AND status = 'active'`,
      [refreshTokenId]
    );
  },

  // Cierra todas las sesiones del usuario (reutilización de un refresh ya revocado).
  async revokeAllForUser(userId, client = pool) {
    await client.query(
      `UPDATE ${TABLE} SET status = 'revoked', revoked_at = NOW() WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );
  },

  // Limpieza: borra los access caducados del usuario al crear uno nuevo.
  async deleteExpiredForUser(userId, client = pool) {
    await client.query(`DELETE FROM ${TABLE} WHERE user_id = $1 AND expires_at <= NOW()`, [userId]);
  }
};
