import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShopService, toQueryParams } from '../../../../core/services/shop.service';
import { ShopStore } from '../../../../core/stores/shop.store';
import {
  DEFAULT_SHOP_FILTERS,
  ShopFilters,
  ShopPagination,
  ShopRoute,
  ShopSort
} from '../../../../core/models/shop.model';
import { SearchBar } from '../../../../shared/components/search-bar/search-bar';
import { FilterBar } from '../../../../shared/components/filter-bar/filter-bar';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { RouteShopCard } from '../../components/route-shop-card/route-shop-card';

const SORTS: ShopSort[] = ['recent', 'distance_asc', 'distance_desc', 'duration_asc', 'title_asc'];

/** Lee los filtros de la URL. Los valores no válidos vuelven al valor por defecto. */
function filtersFromParams(params: ParamMap): ShopFilters {
  const page = Number.parseInt(params.get('page') ?? '', 10);
  const limit = Number.parseInt(params.get('limit') ?? '', 10);
  const sort = params.get('sort') as ShopSort | null;

  return {
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    host: params.get('host') ?? '',
    location: params.get('location') ?? '',
    difficulty: params.get('difficulty') ?? '',
    surface: params.get('surface') ?? '',
    sort: sort && SORTS.includes(sort) ? sort : DEFAULT_SHOP_FILTERS.sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : DEFAULT_SHOP_FILTERS.limit
  };
}

@Component({
  selector: 'app-shop-list',
  imports: [SearchBar, FilterBar, Pagination, SkeletonLoader, EmptyState, ErrorState, RouteShopCard],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="page-eyebrow">Catálogo</p>
          <h1 class="page-title">Rutas</h1>
          @if (pagination(); as p) {
            <p class="page-subtitle">{{ p.total }} {{ p.total === 1 ? 'ruta encontrada' : 'rutas encontradas' }}</p>
          }
        </div>
        @if (store.hasActiveFilters()) {
          <button type="button" class="btn-secondary text-sm" (click)="reset()">Limpiar filtros</button>
        }
      </header>

      <div class="mb-4 max-w-xl">
        <app-search-bar [value]="store.filters().search" (searchChange)="onSearch($event)" />
      </div>

      <app-filter-bar class="mb-8 block"
                      [filters]="store.filters()"
                      [categories]="store.categories()"
                      [hosts]="store.hosts()"
                      [locations]="store.locations()"
                      (filtersChange)="onFilterChange($event)" />

      @if (loading()) {
        <app-skeleton-loader />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (items().length === 0) {
        <app-empty-state />
      } @else {
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (route of items(); track route._id) {
            <app-route-shop-card [route]="route" />
          }
        </div>

        <div class="mt-10">
          <app-pagination [page]="pagination()?.page ?? 1" [totalPages]="pagination()?.totalPages ?? 1"
                          (pageChange)="onPageChange($event)" />
        </div>
      }
    </section>
  `
})
export class ShopList implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shopService = inject(ShopService);
  readonly store = inject(ShopStore);

  readonly items = signal<ShopRoute[]>([]);
  readonly pagination = signal<ShopPagination | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private controller: AbortController | null = null;
  private querySubscription?: Subscription;

  ngOnInit(): void {
    if (!this.store.loaded) void this.loadCatalogue();

    // Cada cambio de la URL (filtros o página) actualiza el store y pide el listado.
    this.querySubscription = this.route.queryParamMap.subscribe((params) => {
      this.store.setFilters(filtersFromParams(params));
      void this.load();
    });
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.controller?.abort();
  }

  async load(): Promise<void> {
    // Cancela la petición anterior de verdad: solo se queda la última.
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;

    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.shopService.getRoutesAbortable(this.store.filters(), controller.signal);
      this.items.set(response.data.items);
      this.pagination.set(response.data.pagination);
    } catch (error) {
      if (controller.signal.aborted) return; // cancelada por un cambio más reciente
      this.error.set(error instanceof Error ? error.message : 'No se pudieron cargar las rutas.');
    } finally {
      if (!controller.signal.aborted) this.loading.set(false);
    }
  }

  onSearch(term: string): void {
    this.navigate({ ...this.store.filters(), search: term, page: 1 });
  }

  onFilterChange(change: Partial<ShopFilters>): void {
    // Cambiar un filtro vuelve a la primera página.
    this.navigate({ ...this.store.filters(), ...change, page: 1 });
  }

  onPageChange(page: number): void {
    this.navigate({ ...this.store.filters(), page });
  }

  reset(): void {
    this.navigate({ ...DEFAULT_SHOP_FILTERS });
  }

  private navigate(filters: ShopFilters): void {
    this.store.setFilters(filters);
    void this.router.navigate([], { relativeTo: this.route, queryParams: toQueryParams(filters) });
  }

  private async loadCatalogue(): Promise<void> {
    try {
      const [categories, hosts, locations] = await Promise.all([
        this.shopService.getCategories(),
        this.shopService.getHosts(),
        this.shopService.getLocations()
      ]);
      this.store.setCatalogue(categories.data, hosts.data, locations.data);
    } catch {
      // Los filtros siguen funcionando sin las opciones del catálogo.
    }
  }
}
