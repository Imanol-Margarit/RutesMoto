import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DeparturePayload } from '../../../../core/models/departure.model';
import { MotoRoute } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { DeparturesService } from '../../../../core/services/departures.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { DepartureForm } from '../../components/departure-form/departure-form';

@Component({
  selector: 'app-departure-create',
  imports: [DepartureForm, RouterLink, SkeletonLoader],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/departures" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Nueva salida</h1>
          <p class="text-sm text-slate-500">Elige la ruta y programa la fecha, las plazas y el precio.</p>
        </div>
      </header>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        @if (loadingRoutes()) {
          <app-skeleton-loader [rows]="4" />
        } @else {
          <app-departure-form [routes]="routes()" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
        }
      </div>
    </section>
  `
})
export class DepartureCreate implements OnInit {
  private readonly departuresService = inject(DeparturesService);
  private readonly routesService = inject(RoutesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly routes = signal<MotoRoute[]>([]);
  readonly loadingRoutes = signal(false);
  readonly saving = signal(false);

  ngOnInit(): void {
    void this.loadRoutes();
  }

  async loadRoutes(): Promise<void> {
    this.loadingRoutes.set(true);
    try {
      const response = await this.routesService.getAll();
      this.routes.set(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.loadingRoutes.set(false);
    }
  }

  async save(payload: DeparturePayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.departuresService.create(payload);
      await this.alert.toast('Salida creada', response.data.slug);
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
