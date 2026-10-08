import { Injectable, computed, signal } from '@angular/core';
import { MotoRoute } from '../models/route.model';

/** Estado de la tabla de rutas (lo que se está mostrando en la pestaña actual). */
@Injectable({ providedIn: 'root' })
export class RoutesStore {
  private readonly _items = signal<MotoRoute[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly count = computed(() => this._items().length);
  readonly isEmpty = computed(
    () => !this._loading() && !this._error() && this._items().length === 0
  );

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setError(value: string | null): void {
    this._error.set(value);
  }

  setItems(list: MotoRoute[]): void {
    this._items.set(list);
  }

  /** Reemplaza la ruta si existe; si no, la añade al principio. */
  upsert(route: MotoRoute): void {
    this._items.update((list) =>
      list.some((item) => item._id === route._id)
        ? list.map((item) => (item._id === route._id ? route : item))
        : [route, ...list]
    );
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((item) => item._id !== id));
  }

  reset(): void {
    this._items.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
