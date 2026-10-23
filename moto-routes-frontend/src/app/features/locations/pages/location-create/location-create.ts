import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LocationPayload } from '../../../../core/models/location.model';
import { AlertService } from '../../../../core/services/alert.service';
import { LocationsService } from '../../../../core/services/locations.service';
import { LocationsStore } from '../../../../core/stores/locations.store';
import { LocationForm } from '../../components/location-form/location-form';

@Component({
  selector: 'app-location-create',
  imports: [LocationForm, RouterLink],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/locations" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Nueva localización</h1>
          <p class="text-sm text-slate-500">Ciudad, país y coordenadas opcionales.</p>
        </div>
      </header>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <app-location-form [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
      </div>
    </section>
  `
})
export class LocationCreate {
  private readonly locationsService = inject(LocationsService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(LocationsStore);

  readonly saving = signal(false);

  async save(payload: LocationPayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.locationsService.create(payload);
      this.store.upsert(response.data);
      await this.alert.toast('Localización creada', response.data.city);
      await this.router.navigate(['/locations']);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    void this.router.navigate(['/locations']);
  }
}
