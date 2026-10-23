import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Category, CategoryPayload } from '../../../../core/models/category.model';
import { AlertService } from '../../../../core/services/alert.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { CategoriesStore } from '../../../../core/stores/categories.store';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { ImagesManager } from '../../../../shared/components/images-manager/images-manager';
import { CategoryForm } from '../../components/category-form/category-form';

@Component({
  selector: 'app-category-edit',
  imports: [CategoryForm, RouterLink, SkeletonLoader, ErrorState, ImagesManager],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/categories" class="btn-secondary text-xs">← Volver</a>
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-slate-900">Editar categoría</h1>
          <p class="truncate text-sm text-slate-500">{{ category()?.name }}</p>
        </div>
      </header>

      @if (loading()) {
        <app-skeleton-loader [rows]="3" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (category(); as current) {
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-category-form [category]="current" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
        </div>

        <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-images-manager [basePath]="'categories/' + current._id + '/images'" />
        </div>
      }
    </section>
  `
})
export class CategoryEdit implements OnInit {
  /** Llega desde la URL (/categories/:id/edit). */
  id = input.required<string>();

  private readonly categoriesService = inject(CategoriesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(CategoriesStore);

  readonly category = signal<Category | null>(null);
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
      const response = await this.categoriesService.getById(this.id());
      this.category.set(response.data);
    } catch {
      this.error.set('No se pudo cargar la categoría. Puede que se haya eliminado.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(payload: CategoryPayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.categoriesService.update(this.id(), payload);
      this.store.upsert(response.data);
      await this.alert.toast('Categoría actualizada', response.data.name);
      await this.router.navigate(['/categories']);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    void this.router.navigate(['/categories']);
  }
}
