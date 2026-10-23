import { pool } from "../config/db.js";
import { locationModel } from "../models/location.model.js";
import { toColumns } from "../utils/sql.util.js";

// Las columnas se leen con alias camelCase. Latitud y longitud llegan como texto: se convierten.
const SELECT_LOCATION = `
  SELECT t.id AS "_id", t.city, t.region, t.country, t.slug, t.address,
         t.postal_code AS "postalCode", t.latitude, t.longitude, t.status,
         t.is_active AS "isActive", t.created_at AS "createdAt", t.updated_at AS "updatedAt",
         t.deleted_at AS "deletedAt"
  FROM ${locationModel.table} AS t`;

const toLocation = (row) => {
  if (!row) return null;
  return {
    ...row,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude)
  };
};

export const locationRepository = {
  async findAll({ isActive } = {}) {
    const params = [];
    let where = "t.deleted_at IS NULL";
    if (typeof isActive === "boolean") {
      params.push(isActive);
      where += " AND t.is_active = $1";
    }
    const { rows } = await pool.query(`${SELECT_LOCATION} WHERE ${where} ORDER BY t.city ASC`, params);
    return rows.map(toLocation);
  },

  async findDeleted() {
    const { rows } = await pool.query(`${SELECT_LOCATION} WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC`);
    return rows.map(toLocation);
  },

  async findById(id) {
    const { rows } = await pool.query(`${SELECT_LOCATION} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
    return toLocation(rows[0]);
  },

  async findAnyById(id) {
    const { rows } = await pool.query(`${SELECT_LOCATION} WHERE t.id = $1`, [id]);
    return toLocation(rows[0]);
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(`${SELECT_LOCATION} WHERE t.slug = $1 AND t.deleted_at IS NULL`, [slug]);
    return toLocation(rows[0]);
  },

  // Incluye las borradas: el slug de una localización borrada sigue ocupado.
  async slugExists(slug, excludeId = null) {
    const { rowCount } = excludeId
      ? await pool.query("SELECT 1 FROM locations WHERE slug = $1 AND id <> $2 LIMIT 1", [slug, excludeId])
      : await pool.query("SELECT 1 FROM locations WHERE slug = $1 LIMIT 1", [slug]);
    return rowCount > 0;
  },

  async create(data) {
    const { names, values } = toColumns(locationModel.columns, data);
    const { rows } = await pool.query(
      `INSERT INTO locations (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return locationRepository.findAnyById(rows[0].id);
  },

  async update(id, data) {
    const { names, values } = toColumns(locationModel.columns, data);
    if (names.length === 0) return locationRepository.findById(id);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rowCount } = await pool.query(
      `UPDATE locations SET ${sets}, updated_at = NOW() WHERE id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, id]
    );
    return rowCount ? locationRepository.findAnyById(id) : null;
  },

  async softDelete(id) {
    const { rowCount } = await pool.query(
      "UPDATE locations SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount ? locationRepository.findAnyById(id) : null;
  },

  async restore(id) {
    const { rowCount } = await pool.query(
      "UPDATE locations SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL",
      [id]
    );
    return rowCount ? locationRepository.findAnyById(id) : null;
  }
};
