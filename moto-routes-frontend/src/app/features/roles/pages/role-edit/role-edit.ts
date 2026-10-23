import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Role, RolePayload } from '../../../../core/models/role.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RolesService } from '../../../../core/services/roles.service';
import { RolesStore } from '../../../../core/stores/roles.store';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { RoleForm } from '../../components/role-form/role-form';

@Component({
  selector: 'app-role-edit',
  imports: [RoleForm, RouterLink, SkeletonLoader, ErrorState],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/roles" class="btn-secondary text-xs">← Volver</a>
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-slate-900">Editar rol</h1>
          <p class="truncate text-sm text-slate-500">{{ role()?.name }}</p>
        </div>
      </header>

      @if (loading()) {
        <app-skeleton-loader [rows]="3" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (role(); as current) {
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-role-form [role]="current" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
        </div>
      }
    </section>
  `
})
export class RoleEdit implements OnInit {
  /** Llega desde la URL (/roles/:id/edit). */
  id = input.required<string>();

  private readonly rolesService = inject(RolesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(RolesStore);

  readonly role = signal<Role | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.rolesService.getById(this.id());
      this.role.set(response.data);
    } catch {
      this.error.set('No se pudo cargar la rol. Puede que se haya eliminado.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(payload: RolePayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.rolesService.update(this.id(), payload);
      this.store.upsert(response.data);
      await this.alert.toast('Rol actualizado', response.data.name);
      await this.router.navigate(['/roles']);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    void this.router.navigate(['/roles']);
  }
}
