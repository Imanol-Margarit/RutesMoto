import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

/** Estado del listado de usuarios (signals). */
@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly _items = signal<User[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._items().length);

  setItems(items: User[]): void {
    this._items.set(items);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setError(message: string | null): void {
    this._error.set(message);
  }

  upsert(user: User): void {
    this._items.update((list) =>
      list.some((item) => item._id === user._id)
        ? list.map((item) => (item._id === user._id ? user : item))
        : [user, ...list]
    );
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((item) => item._id !== id));
  }
}
