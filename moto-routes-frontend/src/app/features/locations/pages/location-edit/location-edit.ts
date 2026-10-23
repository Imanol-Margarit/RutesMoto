import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location, LocationPayload } from '../../../../core/models/location.model';
import { AlertService } from '../../../../core/services/alert.service';
import { LocationsService } from '../../../../core/services/locations.service';
import { LocationsStore } from '../../../../core/stores/locations.store';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { LocationForm } from '../../components/location-form/location-form';

@Component({
  selector: 'app-location-edit',
  imports: [LocationForm, RouterLink, SkeletonLoader, ErrorState],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/locations" class="btn-secondary text-xs">← Volver</a>
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-slate-900">Editar localización</h1>
          <p class="truncate text-sm text-slate-500">{{ location()?.city }}</p>
        </div>
      </header>

      @if (loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (location(); as current) {
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-location-form [location]="current" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
        </div>
      }
    </section>
  `
})
export class LocationEdit implements OnInit {
  /** Llega desde la URL (/locations/:id/edit). */
  id = input.required<string>();

  private readonly locationsService = inject(LocationsService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(LocationsStore);

  readonly location = signal<Location | null>(null);
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
      const response = await this.locationsService.getById(this.id());
      this.location.set(response.data);
    } catch {
      this.error.set('No se pudo cargar la localización. Puede que se haya eliminado.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(payload: LocationPayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.locationsService.update(this.id(), payload);
      this.store.upsert(response.data);
      await this.alert.toast('Localización actualizada', response.data.city);
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
