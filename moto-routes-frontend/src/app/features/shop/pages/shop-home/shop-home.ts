import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ShopService } from '../../../../core/services/shop.service';
import { ShopStore } from '../../../../core/stores/shop.store';
import { DEFAULT_SHOP_FILTERS, ShopRoute } from '../../../../core/models/shop.model';
import { SearchBar } from '../../../../shared/components/search-bar/search-bar';
import { Carousel } from '../../../../shared/components/carousel/carousel';
import { RouteShopCard } from '../../components/route-shop-card/route-shop-card';
import { CategoryCard } from '../../components/category-card/category-card';
import { HostCard } from '../../components/host-card/host-card';
import { LocationCard } from '../../components/location-card/location-card';

@Component({
  selector: 'app-shop-home',
  imports: [SearchBar, Carousel, RouteShopCard, CategoryCard, HostCard, LocationCard],
  template: `
    <!-- Portada -->
    <section class="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 text-white">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">Rutas y salidas en moto</p>
        <h1 class="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Encuentra tu próxima carretera</h1>
        <p class="mt-4 max-w-2xl text-teal-50/90">
          Puertos, costas y valles seleccionados por guías de la zona. Reserva tu plaza en la próxima salida.
        </p>
        <div class="mt-8 flex max-w-xl gap-2">
          <div class="flex-1"><app-search-bar placeholder="Busca por nombre o descripción" (searchChange)="query.set($event)" /></div>
          <button type="button" class="btn-primary !bg-white !text-teal-800 hover:!bg-teal-50" (click)="search()">Buscar</button>
        </div>
      </div>
    </section>

    <!-- Rutas recientes -->
    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <p class="page-eyebrow">Novedades</p>
          <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Rutas recientes</h2>
        </div>
        <button type="button" class="text-sm font-semibold text-teal-700 hover:text-teal-800" (click)="open({})">Ver todas →</button>
      </div>

      @if (loadingRoutes()) {
        <p class="text-sm text-slate-500">Cargando rutas...</p>
      } @else if (featured().length === 0) {
        <div class="card-flush px-6 py-14 text-center text-sm text-slate-500">Todavía no hay rutas publicadas.</div>
      } @else {
        <app-carousel>
          @for (route of featured(); track route._id) {
            <div class="w-72 shrink-0 snap-start"><app-route-shop-card [route]="route" /></div>
          }
        </app-carousel>
      }
    </section>

    <!-- Categorías -->
    @if (store.categories().length) {
      <section class="bg-white/60 py-14">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p class="page-eyebrow">Explora</p>
          <h2 class="mb-8 text-2xl font-semibold tracking-tight text-slate-900">Por tipo de ruta</h2>
          <app-carousel>
            @for (category of store.categories(); track category._id) {
              <div class="w-64 shrink-0 snap-start">
                <app-category-card [category]="category" (selected)="open({ category: $event })" />
              </div>
            }
          </app-carousel>
        </div>
      </section>
    }

    <!-- Guías -->
    @if (store.hosts().length) {
      <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p class="page-eyebrow">Quién te guía</p>
        <h2 class="mb-8 text-2xl font-semibold tracking-tight text-slate-900">Nuestros guías</h2>
        <app-carousel>
          @for (host of store.hosts(); track host._id) {
            <div class="w-72 shrink-0 snap-start">
              <app-host-card [host]="host" (selected)="open({ host: $event })" />
            </div>
          }
        </app-carousel>
      </section>
    }

    <!-- Localizaciones -->
    @if (store.locations().length) {
      <section class="bg-white/60 py-14">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p class="page-eyebrow">Dónde rodar</p>
          <h2 class="mb-8 text-2xl font-semibold tracking-tight text-slate-900">Localizaciones</h2>
          <app-carousel>
            @for (location of store.locations(); track location._id) {
              <div class="w-64 shrink-0 snap-start">
                <app-location-card [location]="location" (selected)="open({ location: $event })" />
              </div>
            }
          </app-carousel>
        </div>
      </section>
    }
  `
})
export class ShopHome implements OnInit {
  private readonly shopService = inject(ShopService);
  private readonly router = inject(Router);
  readonly store = inject(ShopStore);

  readonly query = signal('');
  readonly featured = signal<ShopRoute[]>([]);
  readonly loadingRoutes = signal(true);

  ngOnInit(): void {
    void this.loadCatalogue();
    void this.loadFeatured();
  }

  search(): void {
    this.open({ search: this.query() });
  }

  /** Actualiza el store con los filtros elegidos y lleva al listado con esos mismos filtros en la URL. */
  open(partial: Partial<typeof DEFAULT_SHOP_FILTERS>): void {
    const filters = { ...DEFAULT_SHOP_FILTERS, ...partial };
    this.store.setFilters(filters);
    void this.router.navigate(['/shop/rutas'], { queryParams: this.compact(filters) });
  }

  private compact(filters: typeof DEFAULT_SHOP_FILTERS): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== DEFAULT_SHOP_FILTERS[key as keyof typeof DEFAULT_SHOP_FILTERS] && key !== 'page') {
        out[key] = String(value);
      }
    }
    return out;
  }

  private async loadCatalogue(): Promise<void> {
    if (this.store.loaded) return;
    try {
      const [categories, hosts, locations] = await Promise.all([
        this.shopService.getCategories(),
        this.shopService.getHosts(),
        this.shopService.getLocations()
      ]);
      this.store.setCatalogue(categories.data, hosts.data, locations.data);
    } catch {
      // Sin catálogo, la portada sigue funcionando sin esas secciones.
    }
  }

  private async loadFeatured(): Promise<void> {
    try {
      const response = await this.shopService.getRoutes({ sort: 'recent', limit: 9 });
      this.featured.set(response.data.items);
    } catch {
      this.featured.set([]);
    } finally {
      this.loadingRoutes.set(false);
    }
  }
}
