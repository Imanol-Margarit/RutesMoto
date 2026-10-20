import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutePayload } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { RouteForm } from '../../components/route-form/route-form';
import { RoutesStore } from '../../../../core/stores/routes.store';

@Component({
  selector: 'app-route-create',
  imports: [RouteForm, RouterLink],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/routes" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Nueva ruta</h1>
          <p class="text-sm text-slate-500">Rellena los datos de la ruta. Las imágenes se añaden después, al editarla.</p>
        </div>
      </header>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <app-route-form [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
      </div>
    </section>
  `
})
export class RouteCreate {
  private readonly routesService = inject(RoutesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(RoutesStore);

  readonly saving = signal(false);

  async save(payload: RoutePayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.routesService.create(payload);
      this.store.upsert(response.data);
      await this.alert.toast('Ruta creada', response.data.title);
      await this.router.navigate(['/routes']);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    void this.router.navigate(['/routes']);
  }
}
