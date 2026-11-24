import { wishlistRepository } from "../repositories/wishlist.repository.js";
import { shopRepository } from "../repositories/shop.repository.js";
import { toRouteCard } from "./shop.service.js";
import { AppError } from "../utils/app-error.js";

export const wishlistService = {
  /** Lista del usuario logueado: { count, items } con tarjetas de ruta + addedAt. */
  async list(userId) {
    const rows = await wishlistRepository.findByUser(userId);
    const items = rows.map((row) => ({ ...toRouteCard(row), addedAt: row.addedAt }));
    return { count: items.length, items };
  },

  /** Solo se pueden guardar rutas publicadas y visibles en la tienda. */
  async add(userId, slug) {
    const route = await shopRepository.findRouteBySlug(slug);
    if (!route) throw new AppError("Ruta no encontrada", 404);

    const created = await wishlistRepository.add(userId, route._id);
    return { created, slug: route.slug, inWishlist: true };
  },

  async remove(userId, slug) {
    const removed = await wishlistRepository.removeBySlug(userId, slug);
    if (!removed) throw new AppError("Esa ruta no está en tu lista de deseos", 404);
    return { slug, inWishlist: false };
  }
};
