import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MotoRoute, DIFFICULTY_LABELS, STATUS_LABELS, SURFACE_LABELS } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { RoutesStore } from '../../../../core/stores/routes.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-routes-list',
  imports: [RouterLink, SkeletonLoader, ErrorState, EmptyState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Rutas</h1>
          <p class="text-sm text-slate-500">Gestiona las rutas de moto, su estado y sus imágenes.</p>
        </div>
        <a routerLink="/routes/create" class="btn-primary">Nueva ruta</a>
      </header>

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay rutas" message="Crea la primera ruta para empezar." actionLabel="Nueva ruta" actionLink="/routes/create" />
      } @else {
        <p class="mb-3 text-xs text-slate-500">{{ store.count() }} {{ store.count() === 1 ? 'ruta' : 'rutas' }}</p>

        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Título</th>
                <th class="px-4 py-3 font-medium">Distancia</th>
                <th class="px-4 py-3 font-medium">Dificultad</th>
                <th class="px-4 py-3 font-medium">Firme</th>
                <th class="px-4 py-3 font-medium">Estado</th>
                <th class="px-4 py-3 font-medium">Activa</th>
                <th class="px-4 py-3 font-medium">Acciones</th>
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
                    <button
                      type="button"
                      (click)="toggleActive(route)"
                      [disabled]="busyId() === route._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="route.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ route.isActive ? 'Activa' : 'Inactiva' }}
                    </button>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <a [routerLink]="['/routes', route._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      <button type="button" (click)="remove(route)" [disabled]="busyId() === route._id" class="btn-danger text-xs">
                        Eliminar
                      </button>
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
export class RoutesList {
  readonly store = inject(RoutesStore);
  private readonly routesService = inject(RoutesService);
  private readonly alert = inject(AlertService);

  readonly difficultyLabels = DIFFICULTY_LABELS;
  readonly surfaceLabels = SURFACE_LABELS;
  readonly statusLabels = STATUS_LABELS;
  readonly busyId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const response = await this.routesService.getAll();
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
