import { pool } from "../config/db.js";
import { revokedTokenModel } from "../models/revoked-token.model.js";

export const revokedTokenRepository = {
  async isRevoked(jti) {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM ${revokedTokenModel.table} WHERE jti = $1 AND expires_at > NOW() LIMIT 1`,
      [jti]
    );
    return rowCount > 0;
  },

  async revoke(jti, userId, expiresAt) {
    await pool.query(
      `INSERT INTO ${revokedTokenModel.table} (jti, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (jti) DO NOTHING`,
      [jti, userId, expiresAt]
    );
  }
};