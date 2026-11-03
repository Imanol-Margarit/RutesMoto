import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutePayload } from '../../../../core/models/route.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { RouteForm } from '../../components/route-form/route-form';
import { HostsService } from '../../../../core/services/hosts.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { LocationsService } from '../../../../core/services/locations.service';
import { RoutesStore } from '../../../../core/stores/routes.store';

@Component({
  selector: 'app-route-create',
  imports: [RouteForm, RouterLink],
  template: `
    <section class="page">
      <header class="page-header !justify-start">
        <a routerLink="/routes" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="page-title">Nueva ruta</h1>
          <p class="page-subtitle">Rellena los datos de la ruta. Las imágenes se añaden después, al editarla.</p>
        </div>
      </header>

      <div class="card">
        <app-route-form [hosts]="hosts()" [categories]="categories()" [locations]="locations()" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
      </div>
    </section>
  `
})
export class RouteCreate {
  private readonly routesService = inject(RoutesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(RoutesStore);
  private readonly hostsService = inject(HostsService);

  readonly saving = signal(false);
  readonly hosts = signal<{ _id: string; name: string }[]>([]);
  readonly categories = signal<{ _id: string; name: string }[]>([]);
  readonly locations = signal<{ _id: string; city: string }[]>([]);
  private readonly locationsService = inject(LocationsService);
  private readonly categoriesService = inject(CategoriesService);

  constructor() {
    void this.loadHosts();
    void this.loadCategories();
    void this.loadLocations();
  }

  async loadLocations(): Promise<void> {
    try {
      const response = await this.locationsService.getAll();
      this.locations.set(response.data);
    } catch {
      // Sin localizaciones, el select solo muestra "Sin localización".
    }
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
