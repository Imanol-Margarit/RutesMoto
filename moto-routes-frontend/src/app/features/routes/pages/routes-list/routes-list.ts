import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { AlertService } from '../../../../core/services/alert.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { RoutesStore } from '../../../../core/stores/routes.store';
import { DIFFICULTY_LABELS, MotoRoute, RouteDifficulty, RouteStatus, STATUS_LABELS } from '../../../../core/models/route.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';

@Component({
  selector: 'app-routes-list',
  imports: [RouterLink, NgxSkeletonLoaderModule, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Routes Admin</h1>
          <p class="text-sm text-slate-500">Manage motorcycle routes and their availability.</p>
        </div>
        <a routerLink="/routes/create"
           class="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          New route
        </a>
      </header>

      @if (store.loading()) {
        <div class="grid gap-3">
          @for (item of skeletonItems; track $index) {
            <ngx-skeleton-loader [theme]="{ height: '54px', 'border-radius': '14px' }"></ngx-skeleton-loader>
          }
        </div>
      } @else if (store.error()) {
        <app-error-state [message]="store.error()!" (retry)="load()" />
      } @else if (store.isEmpty()) {
        <app-empty-state heading="No se han encontrado rutas" message="Crea tu primera ruta para empezar."
                         actionLabel="New route" actionLink="/routes/create" />
      } @else {
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Route</th>
                <th class="px-4 py-3 font-medium">Region</th>
                <th class="px-4 py-3 font-medium">Distance</th>
                <th class="px-4 py-3 font-medium">Difficulty</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium">Active</th>
                <th class="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (route of store.items(); track route._id) {
                <!-- Una ruta inactiva se pinta entera en gris apagado. -->
                <tr [class.bg-slate-100]="!route.isActive">
                  <td class="px-4 py-3">
                    <a [routerLink]="['/routes', route.slug]" class="hover:underline"
                       [class.text-slate-800]="route.isActive"
                       [class.text-slate-500]="!route.isActive">
                      {{ route.title }}
                    </a>
                    <p class="text-xs text-slate-400">{{ route.slug }}</p>
                  </td>
                  <td class="px-4 py-3" [class.text-slate-600]="route.isActive" [class.text-slate-400]="!route.isActive">
                    {{ route.region }}
                  </td>
                  <td class="px-4 py-3" [class.text-slate-600]="route.isActive" [class.text-slate-400]="!route.isActive">
                    {{ route.distanceKm }} km
                  </td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2.5 py-1 text-xs font-medium"
                          [class]="difficultyClasses(route.difficulty, route.isActive)">
                      {{ difficultyLabels[route.difficulty] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2.5 py-1 text-xs font-medium"
                          [class]="statusClasses(route.status, route.isActive)">
                      {{ statusLabels[route.status] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button (click)="toggleActive(route)" [disabled]="busyId() === route._id"
                            class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                            [class.bg-teal-100]="route.isActive"
                            [class.text-teal-800]="route.isActive"
                            [class.bg-slate-200]="!route.isActive"
                            [class.text-slate-700]="!route.isActive">
                      {{ route.isActive ? 'Active' : 'Inactive' }}
                    </button>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <a [routerLink]="['/routes', route.slug, 'edit']"
                         class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">Edit</a>
                      <button (click)="remove(route)" [disabled]="busyId() === route._id"
                              class="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50">
                        Delete
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
  private readonly alertService = inject(AlertService);

  readonly difficultyLabels = DIFFICULTY_LABELS;
  readonly statusLabels = STATUS_LABELS;
  readonly skeletonItems = Array.from({ length: 8 });

  /** Id de la ruta con una acción en curso (para deshabilitar sus botones). */
  readonly busyId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    try {
      this.store.setLoading(true);
      this.store.setError(null);
      const response = await this.routesService.getAll();
      this.store.setItems(response.data);
    } catch {
      this.store.setItems([]);
      this.store.setError('No se pudieron cargar las rutas. Inténtalo de nuevo.');
    } finally {
      this.store.setLoading(false);
    }
  }

  async toggleActive(route: MotoRoute): Promise<void> {
    try {
      this.busyId.set(route._id);
      const response = route.isActive
        ? await this.routesService.deactivate(route._id)
        : await this.routesService.activate(route._id);
      this.store.upsert(response.data);
    } catch {
      // El interceptor de errores ya muestra la alerta.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(route: MotoRoute): Promise<void> {
    const confirmation = await this.alertService.confirm(
      '¿Eliminar ruta?',
      `La ruta "${route.title}" se eliminará de la lista.`,
      'Eliminar'
    );
    if (!confirmation.isConfirmed) return;

    try {
      this.busyId.set(route._id);
      await this.routesService.remove(route._id);
      this.store.remove(route._id);
      await this.alertService.toast('Ruta eliminada');
    } catch {
      // El interceptor de errores ya muestra la alerta.
    } finally {
      this.busyId.set(null);
    }
  }

  difficultyClasses(difficulty: RouteDifficulty, isActive: boolean): string {
    // Las rutas inactivas pierden el color para que toda la fila se vea apagada.
    if (!isActive) return 'bg-slate-200 text-slate-500';

    switch (difficulty) {
      case 'facil':
        return 'bg-emerald-100 text-emerald-700';
      case 'dificil':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }
  statusClasses(status: RouteStatus, isActive: boolean): string {
    // Igual que la dificultad: si la ruta está inactiva, la pastilla se apaga.
    if (!isActive) return 'bg-slate-200 text-slate-500';

    switch (status) {
      case 'publicada':
        return 'bg-emerald-100 text-emerald-700';
      case 'archivada':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
