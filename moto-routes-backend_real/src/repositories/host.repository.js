import { pool } from "../config/db.js";
import { hostModel } from "../models/host.model.js";
import { toColumns } from "../utils/sql.util.js";

// Las columnas se leen con alias camelCase: la API no cambia.
const SELECT_HOST = `
  SELECT t.id AS "_id", t.user_id AS "userId", t.name, t.slug, t.biography, t.status,
         t.is_active AS "isActive", t.created_at AS "createdAt", t.updated_at AS "updatedAt",
         t.deleted_at AS "deletedAt"
  FROM ${hostModel.table} AS t`;

export const hostRepository = {
  async findAll({ isActive } = {}) {
    const params = [];
    let where = "t.deleted_at IS NULL";
    if (typeof isActive === "boolean") {
      params.push(isActive);
      where += " AND t.is_active = $1";
    }
    const { rows } = await pool.query(`${SELECT_HOST} WHERE ${where} ORDER BY t.created_at DESC`, params);
    return rows;
  },

  async findDeleted() {
    const { rows } = await pool.query(`${SELECT_HOST} WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC`);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`${SELECT_HOST} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
    return rows[0] ?? null;
  },

  async findAnyById(id) {
    const { rows } = await pool.query(`${SELECT_HOST} WHERE t.id = $1`, [id]);
    return rows[0] ?? null;
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(`${SELECT_HOST} WHERE t.slug = $1 AND t.deleted_at IS NULL`, [slug]);
    return rows[0] ?? null;
  },

  // Incluye las borradas: el slug de un guía borrado sigue ocupado.
  async slugExists(slug, excludeId = null) {
    const { rowCount } = excludeId
      ? await pool.query("SELECT 1 FROM hosts WHERE slug = $1 AND id <> $2 LIMIT 1", [slug, excludeId])
      : await pool.query("SELECT 1 FROM hosts WHERE slug = $1 LIMIT 1", [slug]);
    return rowCount > 0;
  },

  async create(data) {
    const { names, values } = toColumns(hostModel.columns, data);
    const { rows } = await pool.query(
      `INSERT INTO hosts (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return hostRepository.findAnyById(rows[0].id);
  },

  async update(id, data) {
    const { names, values } = toColumns(hostModel.columns, data);
    if (names.length === 0) return hostRepository.findById(id);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rowCount } = await pool.query(
      `UPDATE hosts SET ${sets}, updated_at = NOW() WHERE id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, id]
    );
    return rowCount ? hostRepository.findAnyById(id) : null;
  },

  async softDelete(id) {
    const { rowCount } = await pool.query(
      "UPDATE hosts SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount ? hostRepository.findAnyById(id) : null;
  },

  async restore(id) {
    const { rowCount } = await pool.query(
      "UPDATE hosts SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL",
      [id]
    );
    return rowCount ? hostRepository.findAnyById(id) : null;
  }
};
