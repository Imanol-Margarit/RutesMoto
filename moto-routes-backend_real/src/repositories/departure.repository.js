import { pool } from "../config/db.js";
import { departureModel } from "../models/departure.model.js";
import { toColumns } from "../utils/sql.util.js";

// Populate (con JOIN/subconsulta): la ruta a la que pertenece la salida.
const SELECT_DEPARTURE = `
  SELECT t.id AS "_id", t.ruta_id AS "routeId", t.slug,
         t.start_datetime AS "startDatetime", t.end_datetime AS "endDatetime",
         t.capacity, t.booked_participants AS "bookedParticipants", t.price,
         t.status, t.is_active AS "isActive",
         t.created_at AS "createdAt", t.updated_at AS "updatedAt", t.deleted_at AS "deletedAt",
         (SELECT json_build_object('_id', r.id, 'title', r.title, 'slug', r.slug)
          FROM rutas AS r WHERE r.id = t.ruta_id) AS route
  FROM ${departureModel.table} AS t`;

const toDeparture = (row) => (row ? { ...row, price: Number(row.price) } : null);

export const departureRepository = {
  async findAll({ isActive } = {}) {
    const params = [];
    let where = "t.deleted_at IS NULL";
    if (typeof isActive === "boolean") {
      params.push(isActive);
      where += " AND t.is_active = $1";
    }
    const { rows } = await pool.query(`${SELECT_DEPARTURE} WHERE ${where} ORDER BY t.start_datetime ASC`, params);
    return rows.map(toDeparture);
  },

  async findDeleted() {
    const { rows } = await pool.query(
      `${SELECT_DEPARTURE} WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC`
    );
    return rows.map(toDeparture);
  },

  async findById(id) {
    const { rows } = await pool.query(`${SELECT_DEPARTURE} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
    return toDeparture(rows[0]);
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(`${SELECT_DEPARTURE} WHERE t.slug = $1 AND t.deleted_at IS NULL`, [slug]);
    return toDeparture(rows[0]);
  },

  async findAnyById(id) {
    const { rows } = await pool.query(`${SELECT_DEPARTURE} WHERE t.id = $1`, [id]);
    return toDeparture(rows[0]);
  },

  async slugExists(slug, excludeId = null) {
    const { rowCount } = excludeId
      ? await pool.query("SELECT 1 FROM departures WHERE slug = $1 AND id <> $2 LIMIT 1", [slug, excludeId])
      : await pool.query("SELECT 1 FROM departures WHERE slug = $1 LIMIT 1", [slug]);
    return rowCount > 0;
  },

  async create(data) {
    const { names, values } = toColumns(departureModel.columns, data);
    const { rows } = await pool.query(
      `INSERT INTO departures (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return departureRepository.findAnyById(rows[0].id);
  },

  async update(id, data) {
    const { names, values } = toColumns(departureModel.columns, data);
    if (names.length === 0) return departureRepository.findById(id);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rowCount } = await pool.query(
      `UPDATE departures SET ${sets}, updated_at = NOW() WHERE id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, id]
    );
    return rowCount ? departureRepository.findAnyById(id) : null;
  },

  async softDelete(id) {
    const { rowCount } = await pool.query(
      "UPDATE departures SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount ? departureRepository.findAnyById(id) : null;
  },

  async restore(id) {
    const { rowCount } = await pool.query(
      "UPDATE departures SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL",
      [id]
    );
    return rowCount ? departureRepository.findAnyById(id) : null;
  }
};
