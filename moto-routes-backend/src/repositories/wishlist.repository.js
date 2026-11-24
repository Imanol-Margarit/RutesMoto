import { pool } from "../config/db.js";
import { wishlistModel } from "../models/wishlist.model.js";
import { BASE_CONDITIONS, BASE_FROM, JOIN_CARD_DATA, SELECT_CARD } from "./shop.repository.js";

export const wishlistRepository = {
  /**
   * Rutas guardadas por el usuario, con los mismos datos que la tarjeta de la tienda.
   * Solo devuelve las que siguen visibles (publicadas, activas, no borradas).
   */
  async findByUser(userId, client = pool) {
    const { rows } = await client.query(
      `${SELECT_CARD}, w.created_at AS "addedAt"
       ${BASE_FROM}
       JOIN ${wishlistModel.table} AS w ON w.ruta_id = r.id AND w.user_id = $1 AND w.deleted_at IS NULL
       ${JOIN_CARD_DATA}
       WHERE ${BASE_CONDITIONS.join(" AND ")}
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return rows;
  },

  /** Añade la ruta. Si ya estaba guardada no hace nada (idempotente). Devuelve true si la ha insertado. */
  async add(userId, routeId, client = pool) {
    const { rowCount } = await client.query(
      `INSERT INTO wishlists (user_id, ruta_id) VALUES ($1, $2)
       ON CONFLICT (user_id, ruta_id) WHERE deleted_at IS NULL DO NOTHING`,
      [userId, routeId]
    );
    return rowCount > 0;
  },

  /** Quita la ruta (soft delete) buscándola por slug, aunque ya no esté publicada. */
  async removeBySlug(userId, slug, client = pool) {
    const { rowCount } = await client.query(
      `UPDATE wishlists AS w SET deleted_at = NOW(), updated_at = NOW()
       FROM rutas AS r
       WHERE r.id = w.ruta_id AND r.slug = $2 AND w.user_id = $1 AND w.deleted_at IS NULL`,
      [userId, slug]
    );
    return rowCount > 0;
  },

  /** Cuántos usuarios tienen guardada la ruta (para el detalle de la tienda). */
  async countByRoute(routeId, client = pool) {
    const { rows } = await client.query(
      "SELECT COUNT(*)::int AS count FROM wishlists WHERE ruta_id = $1 AND deleted_at IS NULL",
      [routeId]
    );
    return rows[0].count;
  }
};
