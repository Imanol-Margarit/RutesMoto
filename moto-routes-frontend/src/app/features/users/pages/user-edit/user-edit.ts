import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Role } from '../../../../core/models/role.model';
import { User, UserPayload } from '../../../../core/models/user.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RolesService } from '../../../../core/services/roles.service';
import { UsersService } from '../../../../core/services/users.service';
import { UsersStore } from '../../../../core/stores/users.store';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { ImagesManager } from '../../../../shared/components/images-manager/images-manager';
import { UserForm } from '../../components/user-form/user-form';

@Component({
  selector: 'app-user-edit',
  imports: [UserForm, RouterLink, SkeletonLoader, ErrorState, ImagesManager],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/users" class="btn-secondary text-xs">← Volver</a>
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-slate-900">Editar usuario</h1>
          <p class="truncate text-sm text-slate-500">{{ user()?.email }}</p>
        </div>
      </header>

      @if (loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (user(); as current) {
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-user-form [user]="current" [roles]="roles()" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
        </div>

        <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-images-manager [basePath]="'users/' + current._id + '/images'" />
        </div>
      }
    </section>
  `
})
export class UserEdit implements OnInit {
  /** Llega desde la URL (/users/:id/edit). */
  id = input.required<string>();

  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(UsersStore);

  readonly user = signal<User | null>(null);
  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  ngOnInit(): void {
    void this.load();
    void this.loadRoles();
  }

  async loadRoles(): Promise<void> {
    try {
      const response = await this.rolesService.getActive();
      this.roles.set(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.usersService.getById(this.id());
      this.user.set(response.data);
    } catch {
      this.error.set('No se pudo cargar el usuario. Puede que se haya eliminado.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(payload: UserPayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.usersService.update(this.id(), payload);
      this.store.upsert(response.data);
      await this.alert.toast('Usuario actualizado', `${response.data.firstName} ${response.data.lastName}`);
      await this.router.navigate(['/users']);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    void this.router.navigate(['/users']);
  }
}
