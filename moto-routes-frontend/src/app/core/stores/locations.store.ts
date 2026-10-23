import { Injectable, computed, signal } from '@angular/core';
import { Location } from '../models/location.model';

/** Estado del listado de localizaciones (signals). */
@Injectable({ providedIn: 'root' })
export class LocationsStore {
  private readonly _items = signal<Location[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._items().length);

  setItems(items: Location[]): void {
    this._items.set(items);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setError(message: string | null): void {
    this._error.set(message);
  }

  upsert(location: Location): void {
    this._items.update((list) =>
      list.some((item) => item._id === location._id)
        ? list.map((item) => (item._id === location._id ? location : item))
        : [location, ...list]
    );
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((item) => item._id !== id));
  }
}
