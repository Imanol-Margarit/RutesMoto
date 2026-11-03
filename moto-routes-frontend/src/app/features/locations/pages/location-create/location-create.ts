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
    <section class="page">
      <header class="page-header !justify-start">
        <a routerLink="/locations" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="page-title">Nueva localización</h1>
          <p class="page-subtitle">Ciudad, país y coordenadas opcionales.</p>
        </div>
      </header>

      <div class="card">
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
