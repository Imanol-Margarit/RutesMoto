import { Injectable, computed, signal } from '@angular/core';
import { Category } from '../models/category.model';

/** Estado del listado de categorías (signals). */
@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private readonly _items = signal<Category[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._items().length);

  setItems(items: Category[]): void {
    this._items.set(items);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setError(message: string | null): void {
    this._error.set(message);
  }

  upsert(category: Category): void {
    this._items.update((list) =>
      list.some((item) => item._id === category._id)
        ? list.map((item) => (item._id === category._id ? category : item))
        : [category, ...list]
    );
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((item) => item._id !== id));
  }
}
