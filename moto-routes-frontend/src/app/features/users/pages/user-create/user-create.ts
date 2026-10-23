import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Role } from '../../../../core/models/role.model';
import { UserPayload } from '../../../../core/models/user.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RolesService } from '../../../../core/services/roles.service';
import { UsersService } from '../../../../core/services/users.service';
import { UsersStore } from '../../../../core/stores/users.store';
import { UserForm } from '../../components/user-form/user-form';

@Component({
  selector: 'app-user-create',
  imports: [UserForm, RouterLink],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/users" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Nuevo usuario</h1>
          <p class="text-sm text-slate-500">Datos de la cuenta y rol asignado.</p>
        </div>
      </header>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <app-user-form [roles]="roles()" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
      </div>
    </section>
  `
})
export class UserCreate implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(UsersStore);

  readonly roles = signal<Role[]>([]);
  readonly saving = signal(false);

  ngOnInit(): void {
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

  async save(payload: UserPayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.usersService.create(payload);
      this.store.upsert(response.data);
      await this.alert.toast('Usuario creado', `${response.data.firstName} ${response.data.lastName}`);
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
