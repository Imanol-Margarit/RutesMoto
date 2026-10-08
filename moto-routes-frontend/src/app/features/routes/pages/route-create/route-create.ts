import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutePayload } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { RouteForm } from '../../components/route-form/route-form';

@Component({
  selector: 'app-route-create',
  imports: [RouteForm, RouterLink],
  template: `
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-center gap-3">
        <a routerLink="/routes" aria-label="Back to routes"
           class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Create Route</h1>
          <p class="text-sm text-gray-500">Fill in the details to add a new route</p>
        </div>
      </div>

      <div class="rounded-2xl border bg-white p-6 shadow-sm">
        <app-route-form [isLoading]="isLoading()" (formSubmit)="onSubmit($event)" (cancelClick)="goBack()" />
      </div>
    </div>
  `
})
export class RouteCreate {
  private readonly routesService = inject(RoutesService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);

  async onSubmit(data: RoutePayload): Promise<void> {
    try {
      this.isLoading.set(true);
      const response = await this.routesService.create(data);
      await this.alertService.toast('Ruta creada', response.data.title);
      await this.router.navigate(['/routes']);
    } catch {
      // El interceptor de errores ya muestra la alerta.
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    void this.router.navigate(['/routes']);
  }
}
