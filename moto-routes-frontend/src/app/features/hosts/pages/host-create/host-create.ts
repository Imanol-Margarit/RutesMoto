import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HostPayload } from '../../../../core/models/host.model';
import { AlertService } from '../../../../core/services/alert.service';
import { HostsService } from '../../../../core/services/hosts.service';
import { HostsStore } from '../../../../core/stores/hosts.store';
import { HostForm } from '../../components/host-form/host-form';

@Component({
  selector: 'app-host-create',
  imports: [HostForm, RouterLink],
  template: `
    <section class="page">
      <header class="page-header !justify-start">
        <a routerLink="/hosts" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="page-title">Nuevo guía</h1>
          <p class="page-subtitle">Datos del guía que organiza las rutas.</p>
        </div>
      </header>

      <div class="card">
        <app-host-form [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
      </div>
    </section>
  `
})
export class HostCreate {
  private readonly hostsService = inject(HostsService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(HostsStore);

  readonly saving = signal(false);

  async save(payload: HostPayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.hostsService.create(payload);
      this.store.upsert(response.data);
      await this.alert.toast('Guía creado', response.data.name);
      await this.router.navigate(['/hosts']);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    void this.router.navigate(['/hosts']);
  }
}
