import { Injectable, computed, signal } from '@angular/core';
import { WishlistItem } from '../models/wishlist.model';

/**
 * Estado de la lista de deseos (signals).
 * - items: tarjetas completas (página /shop/wishlist).
 * - slugs: qué rutas están guardadas (corazón del detalle). Se mantiene aparte para poder
 *   marcar una ruta al momento, antes de recargar las tarjetas.
 */
@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly _items = signal<WishlistItem[]>([]);
  private readonly _slugs = signal<ReadonlySet<string>>(new Set());
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);

  readonly items = this._items.asReadonly();
  readonly slugs = this._slugs.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  /** Número que pinta el badge del navbar. */
  readonly count = computed(() => this._slugs().size);

  has(slug: string): boolean {
    return this._slugs().has(slug);
  }

  setItems(items: WishlistItem[]): void {
    this._items.set(items);
    this._slugs.set(new Set(items.map((item) => item.slug)));
    this._loaded.set(true);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  addSlug(slug: string): void {
    this._slugs.update((set) => new Set(set).add(slug));
  }

  removeSlug(slug: string): void {
    this._slugs.update((set) => {
      const next = new Set(set);
      next.delete(slug);
      return next;
    });
    this._items.update((list) => list.filter((item) => item.slug !== slug));
  }

  clear(): void {
    this._items.set([]);
    this._slugs.set(new Set());
    this._loaded.set(false);
  }
}
