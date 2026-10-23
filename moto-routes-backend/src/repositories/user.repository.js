import { pool } from "../config/db.js";
import { userModel } from "../models/user.model.js";
import { toColumns } from "../utils/sql.util.js";

// passwordHash no aparece en ninguna consulta de lectura.
const SELECT_USER = `
  SELECT t.id AS "_id", t.role_id AS "roleId", t.first_name AS "firstName", t.last_name AS "lastName",
         t.email, t.avatar_url AS "avatarUrl", t.is_active AS "isActive",
         t.created_at AS "createdAt", t.updated_at AS "updatedAt", t.deleted_at AS "deletedAt"
  FROM ${userModel.table} AS t`;

export const userRepository = {
  async findAll({ isActive } = {}) {
    const params = [];
    let where = "t.deleted_at IS NULL";
    if (typeof isActive === "boolean") {
      params.push(isActive);
      where += " AND t.is_active = $1";
    }
    const { rows } = await pool.query(`${SELECT_USER} WHERE ${where} ORDER BY t.last_name ASC`, params);
    return rows;
  },

  async findDeleted() {
    const { rows } = await pool.query(`${SELECT_USER} WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC`);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`${SELECT_USER} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
    return rows[0] ?? null;
  },

  async findAnyById(id) {
    const { rows } = await pool.query(`${SELECT_USER} WHERE t.id = $1`, [id]);
    return rows[0] ?? null;
  },

  async create(data) {
    const { names, values } = toColumns(userModel.columns, data);
    const { rows } = await pool.query(
      `INSERT INTO users (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return userRepository.findAnyById(rows[0].id);
  },

  async update(id, data) {
    const { names, values } = toColumns(userModel.columns, data);
    if (names.length === 0) return userRepository.findById(id);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rowCount } = await pool.query(
      `UPDATE users SET ${sets}, updated_at = NOW() WHERE id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, id]
    );
    return rowCount ? userRepository.findAnyById(id) : null;
  },

  async softDelete(id) {
    const { rowCount } = await pool.query(
      "UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount ? userRepository.findAnyById(id) : null;
  },

  async restore(id) {
    const { rowCount } = await pool.query(
      "UPDATE users SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL",
      [id]
    );
    return rowCount ? userRepository.findAnyById(id) : null;
  }
};
