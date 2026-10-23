import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location, LOCATION_STATUS_OPTIONS } from '../../../../core/models/location.model';
import { AlertService } from '../../../../core/services/alert.service';
import { LocationsService } from '../../../../core/services/locations.service';
import { LocationsStore } from '../../../../core/stores/locations.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-locations-list',
  imports: [RouterLink, SkeletonLoader, ErrorState, EmptyState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Localizaciones</h1>
          <p class="text-sm text-slate-500">Ciudad, región y país donde están las rutas.</p>
        </div>
        <a routerLink="/locations/create" class="btn-primary">Nueva localización</a>
      </header>

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay localizaciones" message="Crea la primera localización para empezar." actionLabel="Nueva localización" actionLink="/locations/create" />
      } @else {
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Ciudad</th>
                <th class="px-4 py-3 font-medium">Región</th>
                <th class="px-4 py-3 font-medium">País</th>
                <th class="px-4 py-3 font-medium">Estado</th>
                <th class="px-4 py-3 font-medium">Activa</th>
                <th class="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (location of store.items(); track location._id) {
                <tr [class.bg-slate-100]="!location.isActive" [class.text-slate-500]="!location.isActive">
                  <td class="px-4 py-3">
                    <p class="font-medium">{{ location.city }}</p>
                    <p class="text-xs text-slate-400">{{ location.slug }}</p>
                  </td>
                  <td class="px-4 py-3">{{ location.region ?? '—' }}</td>
                  <td class="px-4 py-3">{{ location.country }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {{ statusLabels[location.status] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button
                      type="button"
                      (click)="toggleActive(location)"
                      [disabled]="busyId() === location._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="location.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ location.isActive ? 'Activa' : 'Inactiva' }}
                    </button>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <a [routerLink]="['/locations', location._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      <button type="button" (click)="remove(location)" [disabled]="busyId() === location._id" class="btn-danger text-xs">
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
export class LocationsList {
  readonly store = inject(LocationsStore);
  private readonly locationsService = inject(LocationsService);
  private readonly alert = inject(AlertService);

  readonly statusLabels = Object.fromEntries(LOCATION_STATUS_OPTIONS.map((o) => [o.value, o.label]));
  readonly busyId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const response = await this.locationsService.getAll();
      this.store.setItems(response.data);
    } catch {
      this.store.setError('No se pudieron cargar las localizaciones. Inténtalo de nuevo.');
    } finally {
      this.store.setLoading(false);
    }
  }

  async toggleActive(location: Location): Promise<void> {
    this.busyId.set(location._id);
    try {
      const response = await this.locationsService.setActive(location._id, !location.isActive);
      this.store.upsert(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(location: Location): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar localización?', `"${location.city}" se quitará del listado.`, 'Eliminar');
    if (!result.isConfirmed) return;

    this.busyId.set(location._id);
    try {
      await this.locationsService.remove(location._id);
      this.store.remove(location._id);
      await this.alert.toast('Localización eliminada');
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }
}
