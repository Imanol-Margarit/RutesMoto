import { pool } from "../config/db.js";
import { categoryModel } from "../models/category.model.js";
import { toColumns } from "../utils/sql.util.js";

// Las columnas se leen con alias camelCase: la API no cambia.
const SELECT_CATEGORY = `
  SELECT t.id AS "_id", t.name, t.slug, t.description, t.is_active AS "isActive",
         t.created_at AS "createdAt", t.updated_at AS "updatedAt", t.deleted_at AS "deletedAt"
  FROM ${categoryModel.table} AS t`;

export const categoryRepository = {
  async findAll({ isActive } = {}) {
    const params = [];
    let where = "t.deleted_at IS NULL";
    if (typeof isActive === "boolean") {
      params.push(isActive);
      where += " AND t.is_active = $1";
    }
    const { rows } = await pool.query(`${SELECT_CATEGORY} WHERE ${where} ORDER BY t.name ASC`, params);
    return rows;
  },

  async findDeleted() {
    const { rows } = await pool.query(`${SELECT_CATEGORY} WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC`);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`${SELECT_CATEGORY} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
    return rows[0] ?? null;
  },

  async findAnyById(id) {
    const { rows } = await pool.query(`${SELECT_CATEGORY} WHERE t.id = $1`, [id]);
    return rows[0] ?? null;
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(`${SELECT_CATEGORY} WHERE t.slug = $1 AND t.deleted_at IS NULL`, [slug]);
    return rows[0] ?? null;
  },

  // Incluye las borradas: el slug de una categoría borrada sigue ocupado.
  async slugExists(slug, excludeId = null) {
    const { rowCount } = excludeId
      ? await pool.query("SELECT 1 FROM categories WHERE slug = $1 AND id <> $2 LIMIT 1", [slug, excludeId])
      : await pool.query("SELECT 1 FROM categories WHERE slug = $1 LIMIT 1", [slug]);
    return rowCount > 0;
  },

  async create(data) {
    const { names, values } = toColumns(categoryModel.columns, data);
    const { rows } = await pool.query(
      `INSERT INTO categories (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return categoryRepository.findAnyById(rows[0].id);
  },

  async update(id, data) {
    const { names, values } = toColumns(categoryModel.columns, data);
    if (names.length === 0) return categoryRepository.findById(id);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rowCount } = await pool.query(
      `UPDATE categories SET ${sets}, updated_at = NOW() WHERE id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, id]
    );
    return rowCount ? categoryRepository.findAnyById(id) : null;
  },

  async softDelete(id) {
    const { rowCount } = await pool.query(
      "UPDATE categories SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount ? categoryRepository.findAnyById(id) : null;
  },

  async restore(id) {
    const { rowCount } = await pool.query(
      "UPDATE categories SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL",
      [id]
    );
    return rowCount ? categoryRepository.findAnyById(id) : null;
  }
};
