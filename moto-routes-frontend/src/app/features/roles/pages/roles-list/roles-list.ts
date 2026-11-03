import { Component, inject, signal } from '@angular/core';
import { AuthStore } from '../../../../auth/auth.store';
import { RouterLink } from '@angular/router';
import { Role } from '../../../../core/models/role.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RolesService } from '../../../../core/services/roles.service';
import { RolesStore } from '../../../../core/stores/roles.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-roles-list',
  imports: [RouterLink, SkeletonLoader, ErrorState, EmptyState],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Roles</h1>
          <p class="page-subtitle">Permisos y función de cada cuenta del panel.</p>
        </div>
        @if (canWrite()) {
          <a routerLink="/roles/create" class="btn-primary">Nuevo rol</a>
        }
      </header>

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay roles" message="Crea la primera rol para empezar." actionLabel="Nuevo rol" actionLink="/roles/create" />
      } @else {
        <div class="card-flush overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th class="px-4 py-3 font-medium">Nombre</th>
                <th class="px-4 py-3 font-medium">Descripción</th>
                <th class="px-4 py-3 font-medium">Activa</th>
                <th class="w-44 px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (role of store.items(); track role._id) {
                <tr [class.bg-slate-100]="!role.isActive" [class.text-slate-500]="!role.isActive">
                  <td class="px-4 py-3">
                    <p class="font-medium">{{ role.name }}</p>
                    <p class="text-xs text-slate-400">{{ role.slug }}</p>
                  </td>
                  <td class="max-w-xs truncate px-4 py-3 text-slate-600" [title]="role.description ?? ''">{{ role.description ?? '—' }}</td>
                  <td class="px-4 py-3">
                                        @if (canWrite()) {
                      <button
                      type="button"
                      (click)="toggleActive(role)"
                      [disabled]="busyId() === role._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="role.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ role.isActive ? 'Activa' : 'Inactiva' }}
                    </button>
                    } @else {
                      <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{{ role.isActive ? 'Activa' : 'Inactiva' }}</span>
                    }
                  </td>
                  <td class="w-44 px-4 py-3 text-right">
                    <div class="flex justify-end gap-2">
                      @if (canWrite()) {
                        <a [routerLink]="['/roles', role._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      }
                                            @if (canWrite()) {
                        <button type="button" (click)="remove(role)" [disabled]="busyId() === role._id" class="btn-danger text-xs">
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
export class RolesList {
  readonly canWrite = inject(AuthStore).canWrite;
  readonly store = inject(RolesStore);
  private readonly rolesService = inject(RolesService);
  private readonly alert = inject(AlertService);

  readonly busyId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const response = await this.rolesService.getAll();
      this.store.setItems(response.data);
    } catch {
      this.store.setError('No se pudieron cargar las roles. Inténtalo de nuevo.');
    } finally {
      this.store.setLoading(false);
    }
  }

  async toggleActive(role: Role): Promise<void> {
    this.busyId.set(role._id);
    try {
      const response = await this.rolesService.setActive(role._id, !role.isActive);
      this.store.upsert(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(role: Role): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar rol?', `"${role.name}" se quitará del listado.`, 'Eliminar');
    if (!result.isConfirmed) return;

    this.busyId.set(role._id);
    try {
      await this.rolesService.remove(role._id);
      this.store.remove(role._id);
      await this.alert.toast('Rol eliminado');
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }
}
