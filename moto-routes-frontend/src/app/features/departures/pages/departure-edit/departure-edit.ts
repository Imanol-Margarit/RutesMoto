import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Departure, DeparturePayload } from '../../../../core/models/departure.model';
import { MotoRoute } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { DeparturesService } from '../../../../core/services/departures.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { DepartureForm } from '../../components/departure-form/departure-form';

@Component({
  selector: 'app-departure-edit',
  imports: [DepartureForm, RouterLink, SkeletonLoader, ErrorState],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/departures" class="btn-secondary text-xs">← Volver</a>
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-slate-900">Editar salida</h1>
          <p class="truncate text-sm text-slate-500">{{ departure()?.route?.title }}</p>
        </div>
      </header>

      @if (loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (departure(); as current) {
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-departure-form
            [departure]="current"
            [routes]="routes()"
            [isSaving]="saving()"
            (submitted)="save($event)"
            (cancelled)="back()"
          />
        </div>
      }
    </section>
  `
})
export class DepartureEdit implements OnInit {
  /** Llega desde la URL (/departures/:id/edit). */
  id = input.required<string>();

  private readonly departuresService = inject(DeparturesService);
  private readonly routesService = inject(RoutesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly departure = signal<Departure | null>(null);
  readonly routes = signal<MotoRoute[]>([]);
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
      const [departureResponse, routesResponse] = await Promise.all([
        this.departuresService.getById(this.id()),
        this.routesService.getAll()
      ]);
      this.departure.set(departureResponse.data);
      this.routes.set(routesResponse.data);
    } catch {
      this.error.set('No se pudo cargar la salida. Puede que se haya eliminado.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(payload: DeparturePayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.departuresService.update(this.id(), payload);
      await this.alert.toast('Salida actualizada', response.data.slug);
      await this.router.navigate(['/departures']);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    void this.router.navigate(['/departures']);
  }
}
