import { Component, OnInit, inject } from '@angular/core';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { WishlistStore } from '../../../../core/stores/wishlist.store';
import { RouteShopCard } from '../../components/route-shop-card/route-shop-card';
import { WishlistButton } from '../../../../shared/components/wishlist-button/wishlist-button';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

/** /shop/wishlist: rutas guardadas por el usuario logueado (protegida con authGuard). */
@Component({
  selector: 'app-shop-wishlist',
  imports: [RouteShopCard, WishlistButton, EmptyState, SkeletonLoader],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p class="page-eyebrow">Tu cuenta</p>
      <h1 class="mb-6 text-3xl font-bold tracking-tight text-slate-900">
        Mi lista de deseos
        @if (store.count() > 0) { <span class="text-lg font-medium text-slate-400">({{ store.count() }})</span> }
      </h1>

      @if (store.loading() && !store.loaded()) {
        <app-skeleton-loader />
      } @else if (store.items().length === 0) {
        <app-empty-state heading="Todavía no has guardado ninguna ruta"
                         message="Pulsa el corazón en la ficha de una ruta para tenerla a mano."
                         actionLabel="Ver rutas" actionLink="/shop/rutas" />
      } @else {
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (route of store.items(); track route.slug) {
            <div class="relative">
              <app-route-shop-card [route]="route" />
              <!-- Fuera del enlace de la tarjeta: pulsar el corazón no abre la ruta -->
              <div class="absolute right-3 top-3">
                <app-wishlist-button [slug]="route.slug" variant="icon" />
              </div>
            </div>
          }
        </div>
      }
    </section>
  `
})
export class ShopWishlist implements OnInit {
  readonly store = inject(WishlistStore);
  private readonly wishlistService = inject(WishlistService);

  ngOnInit(): void {
    // Siempre fresca al entrar (otra pestaña o el panel pueden haber cambiado rutas).
    void this.wishlistService.load();
  }
}
