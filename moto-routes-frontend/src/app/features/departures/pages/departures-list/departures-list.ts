import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminFilterBar, AdminFilterField, AdminFilterOption } from '../../../../shared/components/admin-filter-bar/admin-filter-bar';
import { compactParams, readParams } from '../../../../core/utils/list-query';
import { RoutesService } from '../../../../core/services/routes.service';
import { AuthStore } from '../../../../auth/auth.store';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Departure, DEPARTURE_STATUS_LABELS } from '../../../../core/models/departure.model';
import { AlertService } from '../../../../core/services/alert.service';
import { DeparturesService } from '../../../../core/services/departures.service';
import { DeparturesStore } from '../../../../core/stores/departures.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

const FILTER_KEYS = ['search', 'isActive', 'status', 'routeId', 'priceMin', 'priceMax'];

@Component({
  selector: 'app-departures-list',
  imports: [DecimalPipe, RouterLink, SkeletonLoader, ErrorState, EmptyState, AdminFilterBar],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Salidas</h1>
          <p class="page-subtitle">Fechas, plazas y precio de cada salida programada.</p>
        </div>
        @if (canWrite()) {
          <a routerLink="/departures/create" class="btn-primary">Nueva salida</a>
        }
      </header>

      <app-admin-filter-bar [fields]="filterFields()" [values]="filters()" (valuesChange)="onFiltersChange($event)" />

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay salidas" message="Programa la primera salida de una ruta." actionLabel="Nueva salida" actionLink="/departures/create" />
      } @else {
        <div class="card-flush overflow-x-auto">
          <table class="data-table">
            <thead>
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
                  <td class="px-4 py-3 font-medium">{{ departure.route?.title ?? 'Ruta no disponible' }}<span class="block text-xs text-slate-400">{{ departure.sku }}</span></td>
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
                                        @if (canWrite()) {
                      <button
                      type="button"
                      (click)="toggleActive(departure)"
                      [disabled]="busyId() === departure._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="departure.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ departure.isActive ? 'Activa' : 'Inactiva' }}
                    </button>
                    } @else {
                      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{{ departure.isActive ? 'Activa' : 'Inactiva' }}</span>
                    }
                  </td>
                  <td class="w-44 px-4 py-3 text-right">
                    <div class="flex justify-end gap-2">
                      @if (canWrite()) {
                        <a [routerLink]="['/departures', departure._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      }
                                            @if (canWrite()) {
                        <button type="button" (click)="remove(departure)" [disabled]="busyId() === departure._id" class="btn-danger text-xs">
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
export class DeparturesList implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private querySub?: Subscription;
  private readonly routesService = inject(RoutesService);
  readonly filters = signal<Record<string, string>>({});
  readonly routeOptions = signal<AdminFilterOption[]>([]);
  readonly filterFields = computed<AdminFilterField[]>(() => [
    { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'scheduled', label: 'Programada' }, { value: 'full', label: 'Completa' }, { value: 'cancelled', label: 'Cancelada' }, { value: 'completed', label: 'Finalizada' }] },
    { key: 'routeId', label: 'Ruta', type: 'select', options: this.routeOptions() },
    { key: 'priceMin', label: 'Precio', type: 'range' },
    { key: 'priceMax', label: 'Precio máx.', type: 'range' },
    { key: 'isActive', label: 'Activo', type: 'select', options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] }
  ]);
  readonly canWrite = inject(AuthStore).canWrite;
  readonly store = inject(DeparturesStore);
  private readonly departuresService = inject(DeparturesService);
  private readonly alert = inject(AlertService);

  readonly statusLabels = DEPARTURE_STATUS_LABELS;
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
      const routes = await this.routesService.getAll();
      this.routeOptions.set(routes.data.map((r) => ({ value: r._id, label: r.title })));
    } catch {
      // Sin opciones, el filtro queda en Todas.
    }
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const response = await this.departuresService.getAll(compactParams(this.filters()));
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
