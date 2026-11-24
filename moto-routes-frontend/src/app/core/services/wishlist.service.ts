import { Injectable, computed, effect, inject, untracked } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Wishlist, WishlistToggleResult } from '../models/wishlist.model';
import { WishlistStore } from '../stores/wishlist.store';
import { AuthStore } from '../../auth/auth.store';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly api = inject(ApiService);
  private readonly store = inject(WishlistStore);
  private readonly auth = inject(AuthStore);
  /** Solo el id: editar el perfil (nombre, avatar) no debe recargar la lista. */
  private readonly userId = computed(() => this.auth.user()?._id ?? null);

  constructor() {
    // Al iniciar sesión se carga la lista; al cerrarla se vacía (cambia de usuario).
    effect(() => {
      const userId = this.userId();
      untracked(() => {
        this.store.clear();
        if (userId) void this.load();
      });
    });
  }

  async load(): Promise<void> {
    if (!this.auth.isAuthenticated()) return;
    this.store.setLoading(true);
    try {
      const response = await this.api.get<ApiResponse<Wishlist>>('wishlist');
      this.store.setItems(response.data.items);
    } catch {
      // El errorInterceptor ya avisa; el store se queda como estaba.
    } finally {
      this.store.setLoading(false);
    }
  }

  add(slug: string): Promise<ApiResponse<WishlistToggleResult>> {
    return this.api.post<ApiResponse<WishlistToggleResult>>(`wishlist/${encodeURIComponent(slug)}`, {});
  }

  remove(slug: string): Promise<ApiResponse<WishlistToggleResult>> {
    return this.api.delete<ApiResponse<WishlistToggleResult>>(`wishlist/${encodeURIComponent(slug)}`);
  }

  /**
   * Guarda o quita la ruta. Actualización optimista: el corazón cambia al momento
   * y, si la API falla, se deshace. Devuelve el estado final.
   */
  async toggle(slug: string): Promise<boolean> {
    const wasSaved = this.store.has(slug);
    if (wasSaved) this.store.removeSlug(slug);
    else this.store.addSlug(slug);

    try {
      if (wasSaved) {
        await this.remove(slug);
      } else {
        await this.add(slug);
        void this.load(); // trae la tarjeta completa para la página de la wishlist
      }
      return !wasSaved;
    } catch {
      if (wasSaved) {
        this.store.addSlug(slug);
        void this.load(); // recupera también la tarjeta quitada
      } else {
        this.store.removeSlug(slug);
      }
      return wasSaved;
    }
  }
}
