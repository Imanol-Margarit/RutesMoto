import { Component, inject, signal } from '@angular/core';
import { AuthStore } from '../../../../auth/auth.store';
import { RouterLink } from '@angular/router';
import { Host, HOST_STATUS_LABELS } from '../../../../core/models/host.model';
import { AlertService } from '../../../../core/services/alert.service';
import { HostsService } from '../../../../core/services/hosts.service';
import { HostsStore } from '../../../../core/stores/hosts.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-hosts-list',
  imports: [RouterLink, SkeletonLoader, ErrorState, EmptyState],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Guías</h1>
          <p class="page-subtitle">Gestiona los guías que organizan las rutas.</p>
        </div>
        @if (canWrite()) {
          <a routerLink="/hosts/create" class="btn-primary">Nuevo guía</a>
        }
      </header>

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay guías" message="Crea el primer guía para empezar." actionLabel="Nuevo guía" actionLink="/hosts/create" />
      } @else {
        <div class="card-flush overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th class="px-4 py-3 font-medium">Nombre</th>
                <th class="px-4 py-3 font-medium">Descripción</th>
                <th class="px-4 py-3 font-medium">Estado</th>
                <th class="px-4 py-3 font-medium">Activo</th>
                <th class="w-44 px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (host of store.items(); track host._id) {
                <tr [class.bg-slate-100]="!host.isActive" [class.text-slate-500]="!host.isActive">
                  <td class="px-4 py-3">
                    <p class="font-medium">{{ host.name }}</p>
                    <p class="text-xs text-slate-400">{{ host.slug }}</p>
                  </td>
                  <td class="max-w-xs truncate px-4 py-3 text-slate-600" [title]="host.biography ?? ''">{{ host.biography ?? '—' }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {{ statusLabels[host.status] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                                        @if (canWrite()) {
                      <button
                      type="button"
                      (click)="toggleActive(host)"
                      [disabled]="busyId() === host._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="host.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ host.isActive ? 'Activo' : 'Inactivo' }}
                    </button>
                    } @else {
                      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{{ host.isActive ? 'Activa' : 'Inactiva' }}</span>
                    }
                  </td>
                  <td class="w-44 px-4 py-3 text-right">
                    <div class="flex justify-end gap-2">
                      @if (canWrite()) {
                        <a [routerLink]="['/hosts', host._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      }
                                            @if (canWrite()) {
                        <button type="button" (click)="remove(host)" [disabled]="busyId() === host._id" class="btn-danger text-xs">
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
export class HostsList {
  readonly canWrite = inject(AuthStore).canWrite;
  readonly store = inject(HostsStore);
  private readonly hostsService = inject(HostsService);
  private readonly alert = inject(AlertService);

  readonly statusLabels = HOST_STATUS_LABELS;
  readonly busyId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const response = await this.hostsService.getAll();
      this.store.setItems(response.data);
    } catch {
      this.store.setError('No se pudieron cargar los guías. Inténtalo de nuevo.');
    } finally {
      this.store.setLoading(false);
    }
  }

  async toggleActive(host: Host): Promise<void> {
    this.busyId.set(host._id);
    try {
      const response = await this.hostsService.setActive(host._id, !host.isActive);
      this.store.upsert(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(host: Host): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar guía?', `"${host.name}" se quitará del listado.`, 'Eliminar');
    if (!result.isConfirmed) return;

    this.busyId.set(host._id);
    try {
      await this.hostsService.remove(host._id);
      this.store.remove(host._id);
      await this.alert.toast('Guía eliminado');
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }
}
