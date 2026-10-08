import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MotoRoute, RoutePayload } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { RouteForm } from '../../components/route-form/route-form';

@Component({
  selector: 'app-route-edit',
  imports: [RouteForm, RouterLink, ErrorState],
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
          <h1 class="text-2xl font-semibold text-gray-900">Edit Route</h1>
          <p class="truncate text-sm text-gray-500">{{ route()?.title }}</p>
        </div>
      </div>

      @if (pageLoading()) {
        <div class="animate-pulse space-y-4">
          <div class="h-10 rounded-lg bg-gray-200"></div>
          <div class="h-32 rounded-lg bg-gray-200"></div>
          <div class="grid grid-cols-3 gap-4">
            <div class="h-10 rounded-lg bg-gray-200"></div>
            <div class="h-10 rounded-lg bg-gray-200"></div>
            <div class="h-10 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      } @else if (route()) {
        <div class="rounded-2xl border bg-white p-6 shadow-sm">
          <app-route-form [route]="route()" [isLoading]="isLoading()"
                          (formSubmit)="onSubmit($event)" (cancelClick)="goBack()" />
        </div>
      } @else {
        <app-error-state message="No se pudo cargar la ruta. Puede que se haya eliminado." (retry)="loadRoute()" />
      }
    </div>
  `
})
export class RouteEdit implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly routesService = inject(RoutesService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  readonly slug = signal('');
  readonly route = signal<MotoRoute | null>(null);
  readonly pageLoading = signal(false);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.slug.set(this.activatedRoute.snapshot.paramMap.get('slug') ?? '');
    void this.loadRoute();
  }

  async loadRoute(): Promise<void> {
    try {
      this.pageLoading.set(true);
      const response = await this.routesService.getBySlug(this.slug());
      this.route.set(response.data);
    } catch {
      this.route.set(null);
    } finally {
      this.pageLoading.set(false);
    }
  }

  async onSubmit(data: RoutePayload): Promise<void> {
    const current = this.route();
    if (!current) return;

    try {
      this.isLoading.set(true);
      // El backend identifica la ruta por _id en el PATCH; el slug solo sirve para cargarla.
      // Si cambia el título, el backend regenera el slug automáticamente.
      const response = await this.routesService.update(current._id, data);
      await this.alertService.toast('Ruta actualizada', response.data.title);
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
