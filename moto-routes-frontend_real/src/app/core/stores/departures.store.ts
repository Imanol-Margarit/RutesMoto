import { Injectable, computed, signal } from '@angular/core';
import { Departure } from '../models/departure.model';

/** Estado del listado de salidas (signals). */
@Injectable({ providedIn: 'root' })
export class DeparturesStore {
  private readonly _items = signal<Departure[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._items().length);

  setItems(items: Departure[]): void {
    this._items.set(items);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setError(message: string | null): void {
    this._error.set(message);
  }

  upsert(departure: Departure): void {
    this._items.update((list) =>
      list.some((item) => item._id === departure._id)
        ? list.map((item) => (item._id === departure._id ? departure : item))
        : [departure, ...list]
    );
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((item) => item._id !== id));
  }
}
