import { Component, input, output } from '@angular/core';
import { ShopCategory, ShopFilters, ShopHost, ShopLocation, ShopSort } from '../../../core/models/shop.model';

/** Filtros del catálogo. Cada opción marca [selected] según el filtro activo, para que se vea al entrar desde la portada. */
@Component({
  selector: 'app-filter-bar',
  template: `
    <div class="card grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Categoría</label>
        <select class="input" (change)="emit({ category: valueOf($event) })">
          <option value="" [selected]="!filters().category">Todas</option>
          @for (c of categories(); track c._id) {
            <option [value]="c.slug" [selected]="c.slug === filters().category">{{ c.name }}</option>
          }
        </select>
      </div>

      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Guía</label>
        <select class="input" (change)="emit({ host: valueOf($event) })">
          <option value="" [selected]="!filters().host">Todos</option>
          @for (h of hosts(); track h._id) {
            <option [value]="h.slug" [selected]="h.slug === filters().host">{{ h.name }}</option>
          }
        </select>
      </div>

      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Localización</label>
        <select class="input" (change)="emit({ location: valueOf($event) })">
          <option value="" [selected]="!filters().location">Todas</option>
          @for (l of locations(); track l._id) {
            <option [value]="l.slug" [selected]="l.slug === filters().location">{{ l.city }}, {{ l.country }}</option>
          }
        </select>
      </div>

      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Dificultad</label>
        <select class="input" (change)="emit({ difficulty: valueOf($event) })">
          <option value="" [selected]="!filters().difficulty">Todas</option>
          <option value="facil" [selected]="filters().difficulty === 'facil'">Fácil</option>
          <option value="media" [selected]="filters().difficulty === 'media'">Media</option>
          <option value="dificil" [selected]="filters().difficulty === 'dificil'">Difícil</option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Ordenar</label>
        <select class="input" (change)="emit({ sort: sortOf($event) })">
          <option value="recent" [selected]="filters().sort === 'recent'">Más recientes</option>
          <option value="distance_asc" [selected]="filters().sort === 'distance_asc'">Distancia: menor a mayor</option>
          <option value="distance_desc" [selected]="filters().sort === 'distance_desc'">Distancia: mayor a menor</option>
          <option value="duration_asc" [selected]="filters().sort === 'duration_asc'">Duración</option>
          <option value="title_asc" [selected]="filters().sort === 'title_asc'">Nombre (A-Z)</option>
        </select>
      </div>
    </div>
  `
})
export class FilterBar {
  filters = input.required<ShopFilters>();
  categories = input<ShopCategory[]>([]);
  hosts = input<ShopHost[]>([]);
  locations = input<ShopLocation[]>([]);

  /** Emite solo el filtro que cambió; la página lo escribe en la URL y en el store. */
  filtersChange = output<Partial<ShopFilters>>();

  emit(change: Partial<ShopFilters>): void {
    this.filtersChange.emit(change);
  }

  valueOf(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  sortOf(event: Event): ShopSort {
    return this.valueOf(event) as ShopSort;
  }
}
