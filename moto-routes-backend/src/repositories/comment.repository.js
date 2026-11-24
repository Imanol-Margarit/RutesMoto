import { pool } from "../config/db.js";
import { commentModel } from "../models/comment.model.js";
import { toColumns } from "../utils/sql.util.js";

// Populate (JOIN): el autor del comentario, solo con los datos públicos.
const SELECT_COMMENT = `
  SELECT c.id AS "_id", c.ruta_id AS "routeId", c.user_id AS "userId",
         c.rating, c.content, c.is_active AS "isActive",
         c.created_at AS "createdAt", c.updated_at AS "updatedAt", c.deleted_at AS "deletedAt",
         json_build_object('_id', u.id, 'firstName', u.first_name, 'lastName', u.last_name, 'avatarUrl', u.avatar_url) AS author
  FROM ${commentModel.table} AS c
  JOIN users AS u ON u.id = c.user_id`;

export const commentRepository = {
  /** Comentarios visibles de una ruta, del más reciente al más antiguo. */
  async findByRoute(routeId, client = pool) {
    const { rows } = await client.query(
      `${SELECT_COMMENT}
       WHERE c.ruta_id = $1 AND c.deleted_at IS NULL AND c.is_active = TRUE
       ORDER BY c.created_at DESC`,
      [routeId]
    );
    return rows;
  },

  /** Media de valoraciones y número de comentarios visibles de una ruta. */
  async statsByRoute(routeId, client = pool) {
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS count, ROUND(AVG(rating)::numeric, 1) AS average
       FROM comments
       WHERE ruta_id = $1 AND deleted_at IS NULL AND is_active = TRUE`,
      [routeId]
    );
    return { count: rows[0].count, average: rows[0].average === null ? null : Number(rows[0].average) };
  },

  async findById(id, client = pool) {
    const { rows } = await client.query(`${SELECT_COMMENT} WHERE c.id = $1 AND c.deleted_at IS NULL`, [id]);
    return rows[0] ?? null;
  },

  async findAnyById(id, client = pool) {
    const { rows } = await client.query(`${SELECT_COMMENT} WHERE c.id = $1`, [id]);
    return rows[0] ?? null;
  },

  async create(data, client = pool) {
    const { names, values } = toColumns(commentModel.columns, data);
    const { rows } = await client.query(
      `INSERT INTO comments (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return commentRepository.findAnyById(rows[0].id, client);
  },

  async update(id, data, client = pool) {
    const { names, values } = toColumns(commentModel.columns, data);
    if (names.length === 0) return commentRepository.findById(id, client);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rowCount } = await client.query(
      `UPDATE comments SET ${sets}, updated_at = NOW() WHERE id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, id]
    );
    return rowCount ? commentRepository.findAnyById(id, client) : null;
  },

  async softDelete(id, client = pool) {
    const { rowCount } = await client.query(
      "UPDATE comments SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount ? commentRepository.findAnyById(id, client) : null;
  }
};
