import { Injectable, computed, signal } from '@angular/core';
import { Role } from '../models/role.model';

/** Estado del listado de roles (signals). */
@Injectable({ providedIn: 'root' })
export class RolesStore {
  private readonly _items = signal<Role[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._items().length);

  setItems(items: Role[]): void {
    this._items.set(items);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setError(message: string | null): void {
    this._error.set(message);
  }

  upsert(role: Role): void {
    this._items.update((list) =>
      list.some((item) => item._id === role._id)
        ? list.map((item) => (item._id === role._id ? role : item))
        : [role, ...list]
    );
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((item) => item._id !== id));
  }
}
