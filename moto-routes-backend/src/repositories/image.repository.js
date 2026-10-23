import { pool, withTransaction } from "../config/db.js";
import { imageColumns, imageModels } from "../models/image.model.js";
import { toColumns } from "../utils/sql.util.js";

// Las columnas se leen con alias camelCase: la API no cambia.
const selectSql = (config) => `
  SELECT id AS "_id", ${config.foreignKey} AS "parentId", image_url AS "imageUrl", alt_text AS "altText",
         sort_order AS "position", is_primary AS "isCover", created_at AS "createdAt"
  FROM ${config.table}`;

// Quita la imagen principal actual: como mucho una por entidad.
async function clearCover(client, config, parentId, exceptImageId = null) {
  const params = [parentId];
  let sql = `UPDATE ${config.table} SET is_primary = false
             WHERE ${config.foreignKey} = $1 AND is_primary AND deleted_at IS NULL`;
  if (exceptImageId) {
    params.push(exceptImageId);
    sql += " AND id <> $2";
  }
  await client.query(sql, params);
}

export const imageRepository = {
  async findByParent(kind, parentId) {
    const config = imageModels[kind];
    const { rows } = await pool.query(
      `${selectSql(config)} WHERE ${config.foreignKey} = $1 AND deleted_at IS NULL
       ORDER BY sort_order ASC, created_at ASC`,
      [parentId]
    );
    return rows;
  },

  async findById(kind, parentId, imageId) {
    const config = imageModels[kind];
    const { rows } = await pool.query(
      `${selectSql(config)} WHERE ${config.foreignKey} = $1 AND id = $2 AND deleted_at IS NULL`,
      [parentId, imageId]
    );
    return rows[0] ?? null;
  },

  create(kind, parentId, data) {
    const config = imageModels[kind];
    return withTransaction(async (client) => {
      if (data.isCover) await clearCover(client, config, parentId);

      const { names, values } = toColumns(imageColumns, data);
      const { rows } = await client.query(
        `INSERT INTO ${config.table} (${config.foreignKey}, ${names.join(", ")})
         VALUES ($1, ${names.map((_, i) => `$${i + 2}`).join(", ")})
         RETURNING id`,
        [parentId, ...values]
      );
      const { rows: created } = await client.query(`${selectSql(config)} WHERE id = $1`, [rows[0].id]);
      return created[0];
    });
  },

  update(kind, parentId, imageId, data) {
    const config = imageModels[kind];
    return withTransaction(async (client) => {
      if (data.isCover) await clearCover(client, config, parentId, imageId);

      const { names, values } = toColumns(imageColumns, data);
      const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
      const { rowCount } = await client.query(
        `UPDATE ${config.table} SET ${sets}, updated_at = NOW()
         WHERE id = $${names.length + 1} AND ${config.foreignKey} = $${names.length + 2} AND deleted_at IS NULL`,
        [...values, imageId, parentId]
      );
      if (!rowCount) return null;

      const { rows } = await client.query(`${selectSql(config)} WHERE id = $1`, [imageId]);
      return rows[0];
    });
  },

  // Soft delete, igual que el resto de tablas.
  async remove(kind, parentId, imageId) {
    const config = imageModels[kind];
    const { rowCount } = await pool.query(
      `UPDATE ${config.table} SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND ${config.foreignKey} = $2 AND deleted_at IS NULL`,
      [imageId, parentId]
    );
    return rowCount > 0;
  }
};
