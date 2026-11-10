import { Injectable, computed, signal } from '@angular/core';
import {
  DEFAULT_SHOP_FILTERS,
  ShopCategory,
  ShopFilters,
  ShopHost,
  ShopLocation
} from '../models/shop.model';

/** Catálogo público (se carga una vez) y filtros activos del listado. */
@Injectable({ providedIn: 'root' })
export class ShopStore {
  private readonly _categories = signal<ShopCategory[]>([]);
  private readonly _hosts = signal<ShopHost[]>([]);
  private readonly _locations = signal<ShopLocation[]>([]);
  private readonly _filters = signal<ShopFilters>({ ...DEFAULT_SHOP_FILTERS });
  private _loaded = false;

  readonly categories = this._categories.asReadonly();
  readonly hosts = this._hosts.asReadonly();
  readonly locations = this._locations.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly hasActiveFilters = computed(() => {
    const f = this._filters();
    return Boolean(f.search || f.category || f.host || f.location || f.difficulty || f.surface);
  });

  get loaded(): boolean {
    return this._loaded;
  }

  setCatalogue(categories: ShopCategory[], hosts: ShopHost[], locations: ShopLocation[]): void {
    this._categories.set(categories);
    this._hosts.set(hosts);
    this._locations.set(locations);
    this._loaded = true;
  }

  setFilters(filters: ShopFilters): void {
    this._filters.set(filters);
  }

  resetFilters(): void {
    this._filters.set({ ...DEFAULT_SHOP_FILTERS });
  }
}
