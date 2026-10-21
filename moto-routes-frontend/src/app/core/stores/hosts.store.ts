import { Injectable, computed, signal } from '@angular/core';
import { Host } from '../models/host.model';

/** Estado del listado de guías (signals). */
@Injectable({ providedIn: 'root' })
export class HostsStore {
  private readonly _items = signal<Host[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._items().length);

  setItems(items: Host[]): void {
    this._items.set(items);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setError(message: string | null): void {
    this._error.set(message);
  }

  upsert(host: Host): void {
    this._items.update((list) =>
      list.some((item) => item._id === host._id)
        ? list.map((item) => (item._id === host._id ? host : item))
        : [host, ...list]
    );
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((item) => item._id !== id));
  }
}
