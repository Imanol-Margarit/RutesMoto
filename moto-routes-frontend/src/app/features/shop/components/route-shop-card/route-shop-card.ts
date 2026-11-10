import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShopRoute } from '../../../../core/models/shop.model';

const DIFFICULTY_LABEL: Record<string, string> = { facil: 'Fácil', media: 'Media', dificil: 'Difícil' };
const SURFACE_LABEL: Record<string, string> = { asfalto: 'Asfalto', mixto: 'Mixto', tierra: 'Tierra' };

/** La ficha completa es un enlace: pulsar en cualquier parte lleva a la ruta. */
@Component({
  selector: 'app-route-shop-card',
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/shop/rutas', route().slug]"
       class="card-flush group flex h-full flex-col transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
      <div class="relative aspect-[4/3] overflow-hidden bg-mint">
        @if (route().image) {
          <img [src]="route().image!.url" [alt]="route().image!.alt ?? route().title"
               class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        } @else {
          <div class="grid h-full place-items-center text-sm text-teal-800/70">Sin imagen</div>
        }
        <span class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {{ difficultyLabel() }}
        </span>
      </div>

      <div class="flex flex-1 flex-col gap-3 p-5">
        <div>
          @if (route().category) {
            <p class="page-eyebrow">{{ route().category!.name }}</p>
          }
          <h3 class="mt-1 text-lg font-semibold leading-snug text-slate-900 group-hover:text-teal-800">{{ route().title }}</h3>
          @if (route().location) {
            <p class="mt-1 text-sm text-slate-500">{{ route().location!.city }}, {{ route().location!.country }}</p>
          }
        </div>

        <dl class="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
          <div>
            <dt class="text-[11px] uppercase tracking-wide text-slate-400">Distancia</dt>
            <dd class="text-sm font-semibold text-slate-800">{{ route().distanceKm }} km</dd>
          </div>
          <div>
            <dt class="text-[11px] uppercase tracking-wide text-slate-400">Firme</dt>
            <dd class="text-sm font-semibold text-slate-800">{{ surfaceLabel() }}</dd>
          </div>
          <div>
            <dt class="text-[11px] uppercase tracking-wide text-slate-400">Desde</dt>
            <dd class="text-sm font-semibold text-slate-800">
              {{ route().minPrice !== null ? (route().minPrice + ' €') : '—' }}
            </dd>
          </div>
        </dl>
      </div>
    </a>
  `
})
export class RouteShopCard {
  route = input.required<ShopRoute>();

  difficultyLabel(): string {
    return DIFFICULTY_LABEL[this.route().difficulty] ?? this.route().difficulty;
  }

  surfaceLabel(): string {
    return SURFACE_LABEL[this.route().surface] ?? this.route().surface;
  }
}
