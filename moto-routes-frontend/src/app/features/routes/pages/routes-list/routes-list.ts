import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminFilterBar, AdminFilterField, AdminFilterOption } from '../../../../shared/components/admin-filter-bar/admin-filter-bar';
import { compactParams, readParams } from '../../../../core/utils/list-query';
import { HostsService } from '../../../../core/services/hosts.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { LocationsService } from '../../../../core/services/locations.service';
import { AuthStore } from '../../../../auth/auth.store';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MotoRoute, DIFFICULTY_LABELS, STATUS_LABELS, SURFACE_LABELS } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { RoutesStore } from '../../../../core/stores/routes.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

const FILTER_KEYS = ['search', 'isActive', 'status', 'difficulty', 'surface', 'hostId', 'categoryId', 'locationId'];

@Component({
  selector: 'app-routes-list',
  imports: [RouterLink, SkeletonLoader, ErrorState, EmptyState, AdminFilterBar],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Rutas</h1>
          <p class="page-subtitle">Gestiona las rutas de moto, su estado y sus imágenes.</p>
        </div>
        @if (canWrite()) {
          <a routerLink="/routes/create" class="btn-primary">Nueva ruta</a>
        }
      </header>

      <app-admin-filter-bar [fields]="filterFields()" [values]="filters()" (valuesChange)="onFiltersChange($event)" />

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay rutas" message="Crea la primera ruta para empezar." actionLabel="Nueva ruta" actionLink="/routes/create" />
      } @else {
        <p class="mb-3 text-xs text-slate-500">{{ store.count() }} {{ store.count() === 1 ? 'ruta' : 'rutas' }}</p>

        <div class="card-flush overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th class="px-4 py-3 font-medium">Título</th>
                <th class="px-4 py-3 font-medium">Distancia</th>
                <th class="px-4 py-3 font-medium">Dificultad</th>
                <th class="px-4 py-3 font-medium">Firme</th>
                <th class="px-4 py-3 font-medium">Estado</th>
                <th class="px-4 py-3 font-medium">Activa</th>
                <th class="w-44 px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (route of store.items(); track route._id) {
                <tr [class.bg-slate-100]="!route.isActive" [class.text-slate-500]="!route.isActive">
                  <td class="px-4 py-3">
                    <p class="font-medium">{{ route.title }}</p>
                    <p class="text-xs text-slate-400">{{ route.slug }}</p>
                  </td>
                  <td class="px-4 py-3">{{ route.distanceKm }} km</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2.5 py-1 text-xs font-medium" [class]="difficultyClass(route)">
                      {{ difficultyLabels[route.difficulty] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">{{ surfaceLabels[route.surface] }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {{ statusLabels[route.status] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                                        @if (canWrite()) {
                      <button
                      type="button"
                      (click)="toggleActive(route)"
                      [disabled]="busyId() === route._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="route.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ route.isActive ? 'Activa' : 'Inactiva' }}
                    </button>
                    } @else {
                      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{{ route.isActive ? 'Activa' : 'Inactiva' }}</span>
                    }
                  </td>
                  <td class="w-44 px-4 py-3 text-right">
                    <div class="flex justify-end gap-2">
                      @if (canWrite()) {
                        <a [routerLink]="['/routes', route._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      }
                                            @if (canWrite()) {
                        <button type="button" (click)="remove(route)" [disabled]="busyId() === route._id" class="btn-danger text-xs">
                        Eliminar
                      </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `
})
export class RoutesList implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private querySub?: Subscription;
  private readonly hostsService = inject(HostsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly locationsService = inject(LocationsService);
  readonly filters = signal<Record<string, string>>({});
  readonly hostOptions = signal<AdminFilterOption[]>([]);
  readonly categoryOptions = signal<AdminFilterOption[]>([]);
  readonly locationOptions = signal<AdminFilterOption[]>([]);
  readonly filterFields = computed<AdminFilterField[]>(() => [
    { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'borrador', label: 'Borrador' }, { value: 'publicada', label: 'Publicada' }, { value: 'archivada', label: 'Archivada' }] },
    { key: 'difficulty', label: 'Dificultad', type: 'select', options: [{ value: 'facil', label: 'Fácil' }, { value: 'media', label: 'Media' }, { value: 'dificil', label: 'Difícil' }] },
    { key: 'surface', label: 'Firme', type: 'select', options: [{ value: 'asfalto', label: 'Asfalto' }, { value: 'mixto', label: 'Mixto' }, { value: 'tierra', label: 'Tierra' }] },
    { key: 'hostId', label: 'Guía', type: 'select', options: this.hostOptions() },
    { key: 'categoryId', label: 'Categoría', type: 'select', options: this.categoryOptions() },
    { key: 'locationId', label: 'Localización', type: 'select', options: this.locationOptions() },
    { key: 'isActive', label: 'Activo', type: 'select', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] }
  ]);
  readonly canWrite = inject(AuthStore).canWrite;
  readonly store = inject(RoutesStore);
  private readonly routesService = inject(RoutesService);
  private readonly alert = inject(AlertService);

  readonly difficultyLabels = DIFFICULTY_LABELS;
  readonly surfaceLabels = SURFACE_LABELS;
  readonly statusLabels = STATUS_LABELS;
  readonly busyId = signal<string | null>(null);

  constructor() {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      this.filters.set(readParams(params, FILTER_KEYS));
      void this.load();
    });
    void this.loadOptions();
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  onFiltersChange(values: Record<string, string>): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: compactParams(values) });
  }

  private async loadOptions(): Promise<void> {
    try {
      const [hosts, categories, locations] = await Promise.all([this.hostsService.getAll(), this.categoriesService.getAll(), this.locationsService.getAll()]);
      this.hostOptions.set(hosts.data.map((h) => ({ value: h._id, label: h.name })));
      this.categoryOptions.set(categories.data.map((c) => ({ value: c._id, label: c.name })));
      this.locationOptions.set(locations.data.map((l) => ({ value: l._id, label: l.city })));
    } catch {
      // Sin opciones, los filtros quedan en Todos.
    }
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const response = await this.routesService.getAll(compactParams(this.filters()));
      this.store.setItems(response.data);
    } catch {
      this.store.setError('No se pudieron cargar las rutas. Inténtalo de nuevo.');
    } finally {
      this.store.setLoading(false);
    }
  }

  async toggleActive(route: MotoRoute): Promise<void> {
    this.busyId.set(route._id);
    try {
      const response = await this.routesService.setActive(route._id, !route.isActive);
      this.store.upsert(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(route: MotoRoute): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar ruta?', `"${route.title}" se quitará del listado.`, 'Eliminar');
    if (!result.isConfirmed) return;

    this.busyId.set(route._id);
    try {
      await this.routesService.remove(route._id);
      this.store.remove(route._id);
      await this.alert.toast('Ruta eliminada');
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  difficultyClass(route: MotoRoute): string {
    if (!route.isActive) return 'bg-slate-200 text-slate-500';
    switch (route.difficulty) {
      case 'facil':
        return 'bg-emerald-100 text-emerald-700';
      case 'dificil':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }
}
