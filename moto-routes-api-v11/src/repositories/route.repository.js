import { pool } from "../config/db.js";
import { routeModel } from "../models/route.model.js";
import { toColumns } from "../utils/sql.util.js";

// Las columnas se leen con alias camelCase: la API no cambia.
const SELECT_ROUTE = `
  SELECT t.id AS "_id", t.title, t.distance_km AS "distanceKm", t.difficulty, t.description,
         t.slug, t.surface, t.start_point AS "startPoint",
         t.estimated_minutes AS "estimatedMinutes", t.status, t.is_active AS "isActive",
         t.host_id AS "hostId", t.category_id AS "categoryId", t.location_id AS "locationId",
         t.created_at AS "createdAt", t.updated_at AS "updatedAt", t.deleted_at AS "deletedAt"
  FROM ${routeModel.table} AS t`;

// NUMERIC llega de PostgreSQL como texto: lo convertimos en número.
const toRoute = (row) => (row ? { ...row, distanceKm: Number(row.distanceKm) } : null);

export const routeRepository = {
  async findAll({ isActive } = {}) {
    const params = [];
    let where = "t.deleted_at IS NULL";
    if (typeof isActive === "boolean") {
      params.push(isActive);
      where += " AND t.is_active = $1";
    }
    const { rows } = await pool.query(`${SELECT_ROUTE} WHERE ${where} ORDER BY t.created_at DESC`, params);
    return rows.map(toRoute);
  },

  async findDeleted() {
    const { rows } = await pool.query(
      `${SELECT_ROUTE} WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC`
    );
    return rows.map(toRoute);
  },

  async findById(id) {
    const { rows } = await pool.query(`${SELECT_ROUTE} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
    return toRoute(rows[0]);
  },

  async findAnyById(id) {
    const { rows } = await pool.query(`${SELECT_ROUTE} WHERE t.id = $1`, [id]);
    return toRoute(rows[0]);
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(`${SELECT_ROUTE} WHERE t.slug = $1 AND t.deleted_at IS NULL`, [slug]);
    return toRoute(rows[0]);
  },

  // Incluye las borradas: el slug de una ruta borrada sigue ocupado.
  async slugExists(slug, excludeId = null) {
    const { rowCount } = excludeId
      ? await pool.query("SELECT 1 FROM rutas WHERE slug = $1 AND id <> $2 LIMIT 1", [slug, excludeId])
      : await pool.query("SELECT 1 FROM rutas WHERE slug = $1 LIMIT 1", [slug]);
    return rowCount > 0;
  },

  async create(data) {
    const { names, values } = toColumns(routeModel.columns, data);
    const { rows } = await pool.query(
      `INSERT INTO rutas (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return routeRepository.findAnyById(rows[0].id);
  },

  async update(id, data) {
    const { names, values } = toColumns(routeModel.columns, data);
    if (names.length === 0) return routeRepository.findById(id);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rowCount } = await pool.query(
      `UPDATE rutas SET ${sets}, updated_at = NOW() WHERE id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, id]
    );
    return rowCount ? routeRepository.findAnyById(id) : null;
  },

  async softDelete(id) {
    const { rowCount } = await pool.query(
      "UPDATE rutas SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount ? routeRepository.findAnyById(id) : null;
  },

  async restore(id) {
    const { rowCount } = await pool.query(
      "UPDATE rutas SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL",
      [id]
    );
    return rowCount ? routeRepository.findAnyById(id) : null;
  }
};
