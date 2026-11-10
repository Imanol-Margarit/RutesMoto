import { Component, input, output } from '@angular/core';
import { ShopCategory } from '../../../../core/models/shop.model';

@Component({
  selector: 'app-category-card',
  template: `
    <button type="button" (click)="selected.emit(category().slug)"
            class="card flex h-full w-full flex-col justify-between text-left transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
      <span class="page-eyebrow">Categoría</span>
      <span class="mt-6 text-lg font-semibold text-slate-900">{{ category().name }}</span>
      <span class="mt-2 text-sm font-semibold text-teal-700">Ver rutas →</span>
    </button>
  `
})
export class CategoryCard {
  category = input.required<ShopCategory>();
  selected = output<string>();
}
