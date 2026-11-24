import { ShopRoute } from './shop.model';

/** Ruta guardada: la misma tarjeta de la tienda más la fecha en que se guardó. */
export interface WishlistItem extends ShopRoute {
  addedAt: string;
}

/** Respuesta de GET /wishlist. */
export interface Wishlist {
  count: number;
  items: WishlistItem[];
}

/** Respuesta de POST y DELETE /wishlist/:slug. */
export interface WishlistToggleResult {
  slug: string;
  inWishlist: boolean;
}
