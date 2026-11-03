import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CategoryPayload } from '../../../../core/models/category.model';
import { AlertService } from '../../../../core/services/alert.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { CategoriesStore } from '../../../../core/stores/categories.store';
import { CategoryForm } from '../../components/category-form/category-form';

@Component({
  selector: 'app-category-create',
  imports: [CategoryForm, RouterLink],
  template: `
    <section class="page">
      <header class="page-header !justify-start">
        <a routerLink="/categories" class="btn-secondary text-xs">← Volver</a>
        <div>
          <h1 class="page-title">Nueva categoría</h1>
          <p class="page-subtitle">Nombre y descripción del tipo de ruta.</p>
        </div>
      </header>

      <div class="card">
        <app-category-form [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
      </div>
    </section>
  `
})
export class CategoryCreate {
  private readonly categoriesService = inject(CategoriesService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(CategoriesStore);

  readonly saving = signal(false);

  async save(payload: CategoryPayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.categoriesService.create(payload);
      this.store.upsert(response.data);
      await this.alert.toast('Categoría creada', response.data.name);
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
