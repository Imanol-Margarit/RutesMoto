import { pool } from "../config/db.js";
import { profileModel } from "../models/profile.model.js";
import { toColumns } from "../utils/sql.util.js";

const SELECT_PROFILE = `
  SELECT t.id AS "_id", t.user_id AS "userId", t.phone, t.bio,
         t.created_at AS "createdAt", t.updated_at AS "updatedAt"
  FROM ${profileModel.table} AS t`;

export const profileRepository = {
  async findByUserId(userId) {
    const { rows } = await pool.query(`${SELECT_PROFILE} WHERE t.user_id = $1 AND t.deleted_at IS NULL`, [userId]);
    return rows[0] ?? null;
  },

  async create(userId, data = {}) {
    await pool.query(
      "INSERT INTO profiles (user_id, phone, bio) VALUES ($1, $2, $3)",
      [userId, data.phone ?? null, data.bio ?? null]
    );
    return profileRepository.findByUserId(userId);
  },

  async update(userId, data, client = pool) {
    const { names, values } = toColumns(profileModel.columns, data);
    if (names.length === 0) return profileRepository.findByUserId(userId);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    await client.query(
      `UPDATE profiles SET ${sets}, updated_at = NOW() WHERE user_id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, userId]
    );
    return profileRepository.findByUserId(userId);
  }
};
