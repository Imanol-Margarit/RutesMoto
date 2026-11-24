import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { WishlistStore } from '../../../core/stores/wishlist.store';

/**
 * Acceso a la lista de deseos para el navbar: corazón con el número de rutas guardadas.
 * Inyecta WishlistService para que arranque su efecto (cargar al iniciar sesión, vaciar al cerrarla).
 * Ponerlo solo cuando hay sesión.
 */
@Component({
  selector: 'app-wishlist-link',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a routerLink="/shop/wishlist" routerLinkActive="!bg-white"
       class="relative grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-white/80"
       [attr.aria-label]="'Mi lista de deseos (' + store.count() + ')'" title="Mi lista de deseos">
      <svg viewBox="0 0 24 24" class="h-5 w-5" [class.text-rose-500]="store.count() > 0"
           [attr.fill]="store.count() > 0 ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.5 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.5 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </svg>
      @if (store.count() > 0) {
        <span class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {{ store.count() > 99 ? '99+' : store.count() }}
        </span>
      }
    </a>
  `
})
export class WishlistLink {
  readonly store = inject(WishlistStore);

  constructor() {
    inject(WishlistService); // arranca la carga automática de la lista
  }
}
