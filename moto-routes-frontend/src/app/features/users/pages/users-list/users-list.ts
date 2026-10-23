import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../../../core/models/user.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RolesService } from '../../../../core/services/roles.service';
import { UsersService } from '../../../../core/services/users.service';
import { UsersStore } from '../../../../core/stores/users.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { Role } from '../../../../core/models/role.model';

@Component({
  selector: 'app-users-list',
  imports: [RouterLink, SkeletonLoader, ErrorState, EmptyState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Usuarios</h1>
          <p class="text-sm text-slate-500">Cuentas del panel y de la aplicación, con su rol.</p>
        </div>
        <a routerLink="/users/create" class="btn-primary">Nuevo usuario</a>
      </header>

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay usuarios" message="Crea el primer usuario para empezar." actionLabel="Nuevo usuario" actionLink="/users/create" />
      } @else {
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Usuario</th>
                <th class="px-4 py-3 font-medium">Rol</th>
                <th class="px-4 py-3 font-medium">Activo</th>
                <th class="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (user of store.items(); track user._id) {
                <tr [class.bg-slate-100]="!user.isActive" [class.text-slate-500]="!user.isActive">
                  <td class="px-4 py-3">
                    <p class="font-medium">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="text-xs text-slate-400">{{ user.email }}</p>
                  </td>
                  <td class="px-4 py-3">{{ roleName(user.roleId) }}</td>
                  <td class="px-4 py-3">
                    <button
                      type="button"
                      (click)="toggleActive(user)"
                      [disabled]="busyId() === user._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="user.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </button>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <a [routerLink]="['/users', user._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      <button type="button" (click)="remove(user)" [disabled]="busyId() === user._id" class="btn-danger text-xs">
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
export class UsersList {
  readonly store = inject(UsersStore);
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly alert = inject(AlertService);

  readonly roles = signal<Role[]>([]);
  readonly busyId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const [users, roles] = await Promise.all([this.usersService.getAll(), this.rolesService.getActive()]);
      this.store.setItems(users.data);
      this.roles.set(roles.data);
    } catch {
      this.store.setError('No se pudieron cargar los usuarios. Inténtalo de nuevo.');
    } finally {
      this.store.setLoading(false);
    }
  }

  roleName(roleId: string): string {
    return this.roles().find((role) => role._id === roleId)?.name ?? 'Sin rol';
  }

  async toggleActive(user: User): Promise<void> {
    this.busyId.set(user._id);
    try {
      const response = await this.usersService.setActive(user._id, !user.isActive);
      this.store.upsert(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(user: User): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar usuario?', `"${user.firstName} ${user.lastName}" se quitará del listado.`, 'Eliminar');
    if (!result.isConfirmed) return;

    this.busyId.set(user._id);
    try {
      await this.usersService.remove(user._id);
      this.store.remove(user._id);
      await this.alert.toast('Usuario eliminado');
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }
}
