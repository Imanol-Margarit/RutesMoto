import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../../core/models/category.model';
import { AlertService } from '../../../../core/services/alert.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { CategoriesStore } from '../../../../core/stores/categories.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-categories-list',
  imports: [RouterLink, SkeletonLoader, ErrorState, EmptyState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Categorías</h1>
          <p class="text-sm text-slate-500">Tipos de ruta, como curvas, paisaje u off-road.</p>
        </div>
        <a routerLink="/categories/create" class="btn-primary">Nueva categoría</a>
      </header>

      @if (store.loading()) {
        <app-skeleton-loader [rows]="6" />
      } @else if (store.error(); as message) {
        <app-error-state [message]="message" (retry)="load()" />
      } @else if (store.count() === 0) {
        <app-empty-state heading="No hay categorías" message="Crea la primera categoría para empezar." actionLabel="Nueva categoría" actionLink="/categories/create" />
      } @else {
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Nombre</th>
                <th class="px-4 py-3 font-medium">Descripción</th>
                <th class="px-4 py-3 font-medium">Activa</th>
                <th class="w-44 px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (category of store.items(); track category._id) {
                <tr [class.bg-slate-100]="!category.isActive" [class.text-slate-500]="!category.isActive">
                  <td class="px-4 py-3">
                    <p class="font-medium">{{ category.name }}</p>
                    <p class="text-xs text-slate-400">{{ category.slug }}</p>
                  </td>
                  <td class="max-w-xs truncate px-4 py-3 text-slate-600" [title]="category.description ?? ''">{{ category.description ?? '—' }}</td>
                  <td class="px-4 py-3">
                    <button
                      type="button"
                      (click)="toggleActive(category)"
                      [disabled]="busyId() === category._id"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      [class]="category.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'"
                    >
                      {{ category.isActive ? 'Activa' : 'Inactiva' }}
                    </button>
                  </td>
                  <td class="w-44 px-4 py-3 text-right">
                    <div class="flex justify-end gap-2">
                      <a [routerLink]="['/categories', category._id, 'edit']" class="btn-secondary text-xs">Editar</a>
                      <button type="button" (click)="remove(category)" [disabled]="busyId() === category._id" class="btn-danger text-xs">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `
})
export class CategoriesList {
  readonly store = inject(CategoriesStore);
  private readonly categoriesService = inject(CategoriesService);
  private readonly alert = inject(AlertService);

  readonly busyId = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const response = await this.categoriesService.getAll();
      this.store.setItems(response.data);
    } catch {
      this.store.setError('No se pudieron cargar las categorías. Inténtalo de nuevo.');
    } finally {
      this.store.setLoading(false);
    }
  }

  async toggleActive(category: Category): Promise<void> {
    this.busyId.set(category._id);
    try {
      const response = await this.categoriesService.setActive(category._id, !category.isActive);
      this.store.upsert(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(category: Category): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar categoría?', `"${category.name}" se quitará del listado.`, 'Eliminar');
    if (!result.isConfirmed) return;

    this.busyId.set(category._id);
    try {
      await this.categoriesService.remove(category._id);
      this.store.remove(category._id);
      await this.alert.toast('Categoría eliminada');
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }
}
