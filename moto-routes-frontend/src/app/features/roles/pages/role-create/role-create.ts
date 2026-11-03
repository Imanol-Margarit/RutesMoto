import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RolePayload } from '../../../../core/models/role.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RolesService } from '../../../../core/services/roles.service';
import { RolesStore } from '../../../../core/stores/roles.store';
import { RoleForm } from '../../components/role-form/role-form';

@Component({
  selector: 'app-role-create',
  imports: [RoleForm, RouterLink],
  template: `
    <section class="page">
      <header class="page-header !justify-start">
        <a routerLink="/roles" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="page-title">Nuevo rol</h1>
          <p class="page-subtitle">Nombre y descripción del rol.</p>
        </div>
      </header>

      <div class="card">
        <app-role-form [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
      </div>
    </section>
  `
})
export class RoleCreate {
  private readonly rolesService = inject(RolesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(RolesStore);

  readonly saving = signal(false);

  async save(payload: RolePayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.rolesService.create(payload);
      this.store.upsert(response.data);
      await this.alert.toast('Rol creado', response.data.name);
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
