import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MotoRoute, RoutePayload } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { RouteForm } from '../../components/route-form/route-form';
import { RouteImages } from '../../components/route-images/route-images';
import { RoutesStore } from '../../../../core/stores/routes.store';
import { HostsService } from '../../../../core/services/hosts.service';
import { CategoriesService } from '../../../../core/services/categories.service';

@Component({
  selector: 'app-route-edit',
  imports: [RouteForm, RouteImages, RouterLink, SkeletonLoader, ErrorState],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/routes" class="btn-secondary text-xs">← Volver</a>
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-slate-900">Editar ruta</h1>
          <p class="truncate text-sm text-slate-500">{{ route()?.title }}</p>
        </div>
      </header>

      @if (loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (route(); as current) {
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-route-form [route]="current" [hosts]="hosts()" [categories]="categories()" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
        </div>

        <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-route-images [routeId]="current._id" />
        </div>
      }
    </section>
  `
})
export class RouteEdit implements OnInit {
  /** Llega desde la URL (/routes/:id/edit) gracias a withComponentInputBinding. */
  id = input.required<string>();

  private readonly routesService = inject(RoutesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(RoutesStore);
  private readonly hostsService = inject(HostsService);
  readonly hosts = signal<{ _id: string; name: string }[]>([]);
  readonly categories = signal<{ _id: string; name: string }[]>([]);
  private readonly categoriesService = inject(CategoriesService);

  readonly route = signal<MotoRoute | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  ngOnInit(): void {
    void this.load();
    void this.loadHosts();
    void this.loadCategories();
  }

  async loadCategories(): Promise<void> {
    try {
      const response = await this.categoriesService.getAll();
      this.categories.set(response.data);
    } catch {
      // Sin categorías, el select solo muestra "Sin categoría".
    }
  }

  async loadHosts(): Promise<void> {
    try {
      const response = await this.hostsService.getAll();
      this.hosts.set(response.data);
    } catch {
      // Sin guías, el select solo muestra "Sin guía".
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.routesService.getById(this.id());
      this.route.set(response.data);
    } catch {
      this.error.set('No se pudo cargar la ruta. Puede que se haya eliminado.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(payload: RoutePayload): Promise<void> {
    const current = this.route();
    if (!current) return;

    this.saving.set(true);
    try {
      const response = await this.routesService.update(this.id(), payload);
      this.store.upsert(response.data);
      await this.alert.toast('Ruta actualizada', response.data.title);
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
