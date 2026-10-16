import { pool, withTransaction } from "../config/db.js";
import { routeImageModel } from "../models/image.model.js";
import { toColumns } from "../utils/sql.util.js";

const { table, foreignKey, columns } = routeImageModel;

const SELECT_IMAGE = `
  SELECT id AS "_id", ${foreignKey} AS "routeId", image_url AS "imageUrl", alt_text AS "altText",
         sort_order AS "position", is_primary AS "isCover", created_at AS "createdAt"
  FROM ${table}`;

// Quita la imagen principal actual: como mucho una por ruta.
async function clearCover(client, routeId, exceptImageId = null) {
  const params = [routeId];
  let sql = `UPDATE ${table} SET is_primary = false
             WHERE ${foreignKey} = $1 AND is_primary AND deleted_at IS NULL`;
  if (exceptImageId) {
    params.push(exceptImageId);
    sql += " AND id <> $2";
  }
  await client.query(sql, params);
}

export const imageRepository = {
  async findByRoute(routeId) {
    const { rows } = await pool.query(
      `${SELECT_IMAGE} WHERE ${foreignKey} = $1 AND deleted_at IS NULL ORDER BY sort_order ASC, created_at ASC`,
      [routeId]
    );
    return rows;
  },

  async findById(routeId, imageId) {
    const { rows } = await pool.query(
      `${SELECT_IMAGE} WHERE ${foreignKey} = $1 AND id = $2 AND deleted_at IS NULL`,
      [routeId, imageId]
    );
    return rows[0] ?? null;
  },

  create(routeId, data) {
    return withTransaction(async (client) => {
      if (data.isCover) await clearCover(client, routeId);

      const { names, values } = toColumns(columns, data);
      const placeholders = names.map((_, index) => `$${index + 2}`).join(", ");
      const { rows } = await client.query(
        `INSERT INTO ${table} (${foreignKey}, ${names.join(", ")}) VALUES ($1, ${placeholders}) RETURNING id`,
        [routeId, ...values]
      );

      const { rows: created } = await client.query(`${SELECT_IMAGE} WHERE id = $1`, [rows[0].id]);
      return created[0];
    });
  },

  update(routeId, imageId, data) {
    return withTransaction(async (client) => {
      if (data.isCover) await clearCover(client, routeId, imageId);

      const { names, values } = toColumns(columns, data);
      const sets = names.map((name, index) => `${name} = $${index + 1}`).join(", ");
      const { rowCount } = await client.query(
        `UPDATE ${table} SET ${sets}, updated_at = NOW()
         WHERE id = $${names.length + 1} AND ${foreignKey} = $${names.length + 2} AND deleted_at IS NULL`,
        [...values, imageId, routeId]
      );
      if (!rowCount) return null;

      const { rows } = await client.query(`${SELECT_IMAGE} WHERE id = $1`, [imageId]);
      return rows[0];
    });
  },

  // Soft delete, igual que el resto de tablas.
  async remove(routeId, imageId) {
    const { rowCount } = await pool.query(
      `UPDATE ${table} SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND ${foreignKey} = $2 AND deleted_at IS NULL`,
      [imageId, routeId]
    );
    return rowCount > 0;
  }
};
