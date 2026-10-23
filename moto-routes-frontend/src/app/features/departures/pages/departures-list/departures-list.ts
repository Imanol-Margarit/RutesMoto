import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Departure, DEPARTURE_STATUS_LABELS } from '../../../../core/models/departure.model';
import { AlertService } from '../../../../core/services/alert.service';
import { DeparturesService } from '../../../../core/services/departures.service';
import { DeparturesStore } from '../../../../core/stores/departures.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-departures-list',
  imports: [DecimalPipe, RouterLink, SkeletonLoader, ErrorState, EmptyState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Salidas</h1>
          <p class="text-sm text-slate-500">Fechas, plazas y precio de cada salida programada.</p>
        </div>
        <a routerLink="/departures/create" class="btn-primary">Nueva salida</a>
      </header>

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay salidas" message="Programa la primera salida de una ruta." actionLabel="Nueva salida" actionLink="/departures/create" />
      } @else {
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Ruta</th>
                <th class="px-4 py-3 font-medium">Inicio</th>
                <th class="px-4 py-3 font-medium">Fin</th>
                <th class="px-4 py-3 font-medium">Plazas</th>
                <th class="px-4 py-3 font-medium">Precio</th>
                <th class="px-4 py-3 font-medium">Estado</th>
                <th class="px-4 py-3 font-medium">Activa</th>
                <th class="w-44 px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (departure of store.items(); track departure._id) {
                <tr [class.bg-slate-100]="!departure.isActive" [class.text-slate-500]="!departure.isActive">
                  <td class="px-4 py-3 font-medium">{{ departure.route?.title ?? 'Ruta no disponible' }}</td>
                  <td class="px-4 py-3">{{ formatDate(departure.startDatetime) }}</td>
                  <td class="px-4 py-3">{{ formatDate(departure.endDatetime) }}</td>
                  <td class="px-4 py-3">{{ departure.bookedParticipants }} / {{ departure.capacity }}</td>
                  <td class="px-4 py-3">{{ departure.price | number: '1.2-2' }} €</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {{ statusLabels[departure.status] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button
                      type="button"
                      (click)="toggleActive(departure)"
                      [disabled]="busyId() === departure._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="departure.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ departure.isActive ? 'Activa' : 'Inactiva' }}
                    </button>
                  </td>
                  <td class="w-44 px-4 py-3 text-right">
                    <div class="flex justify-end gap-2">
                      <a [routerLink]="['/departures', departure._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      <button type="button" (click)="remove(departure)" [disabled]="busyId() === departure._id" class="btn-danger text-xs">
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
export class DeparturesList {
  readonly store = inject(DeparturesStore);
  private readonly departuresService = inject(DeparturesService);
  private readonly alert = inject(AlertService);

  readonly statusLabels = DEPARTURE_STATUS_LABELS;
  readonly busyId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const response = await this.departuresService.getAll();
      this.store.setItems(response.data);
    } catch {
      this.store.setError('No se pudieron cargar las salidas. Inténtalo de nuevo.');
    } finally {
      this.store.setLoading(false);
    }
  }

  async toggleActive(departure: Departure): Promise<void> {
    this.busyId.set(departure._id);
    try {
      const response = await this.departuresService.setActive(departure._id, !departure.isActive);
      this.store.upsert(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(departure: Departure): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar salida?', 'La salida se quitará del listado.', 'Eliminar');
    if (!result.isConfirmed) return;

    this.busyId.set(departure._id);
    try {
      await this.departuresService.remove(departure._id);
      this.store.remove(departure._id);
      await this.alert.toast('Salida eliminada');
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }
}
