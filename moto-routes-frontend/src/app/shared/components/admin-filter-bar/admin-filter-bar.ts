import { Component, computed, input, output } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { PriceRange } from '../price-range/price-range';

export interface AdminFilterOption { value: string; label: string; }

export interface AdminFilterField {
  key: string;
  label: string;
  type: 'select' | 'number' | 'range';
  options?: AdminFilterOption[];
}

/**
 * Barra de filtros del panel, toda en una fila. Reconoce sus filtros por la clave:
 * - "search": buscador (ancho fijo, más estrecho)
 * - "priceMin" + "priceMax": slider de precio
 * - "isActive": botón que alterna Todos / Sí / No
 * El resto son desplegables pequeños.
 */
@Component({
  selector: 'app-admin-filter-bar',
  imports: [SearchBar, PriceRange],
  template: `
    <div class="mb-8 flex flex-wrap items-end gap-3">
      <div class="w-72">
        <app-search-bar class="block w-full" [value]="values()['search'] ?? ''" placeholder="Buscar..."
                        (searchChange)="set('search', $event)" />
      </div>

      @for (field of selectFields(); track field.key) {
        <div class="flex flex-col">
          <label class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{{ field.label }}</label>
          @if (field.type === 'select') {
            <select class="input !w-40 !py-1.5 !text-xs" (change)="set(field.key, valueOf($event))">
              <option value="" [selected]="!values()[field.key]">Todos</option>
              @for (option of field.options ?? []; track option.value) {
                <option [value]="option.value" [selected]="values()[field.key] === option.value">{{ option.label }}</option>
              }
            </select>
          } @else {
            <input type="number" min="0" class="input !w-32 !py-1.5 !text-xs" [value]="values()[field.key] ?? ''"
                   (change)="set(field.key, valueOf($event))" />
          }
        </div>
      }

      @if (hasActive()) {
        <div class="flex flex-col">
          <span class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Activo</span>
          <button type="button" class="btn-secondary !px-3 !py-1.5 text-xs" (click)="cycleActive()">
            {{ activeLabel() }}
          </button>
        </div>
      }

      @if (hasPrice()) {
        <div class="min-w-80 flex-1">
          <app-price-range [compact]="true" [priceMin]="values()['priceMin'] ?? ''" [priceMax]="values()['priceMax'] ?? ''"
                           (rangeChange)="setPrice($event)" />
        </div>
      }
    </div>
  `
})
export class AdminFilterBar {
  fields = input<AdminFilterField[]>([]);
  values = input.required<Record<string, string>>();
  valuesChange = output<Record<string, string>>();

  readonly hasPrice = computed(() => this.fields().some((f) => f.key === 'priceMin'));
  readonly hasActive = computed(() => this.fields().some((f) => f.key === 'isActive'));
  readonly selectFields = computed(() =>
    this.fields().filter((f) => !['search', 'priceMin', 'priceMax', 'isActive'].includes(f.key))
  );
  readonly activeLabel = computed(() => {
    const value = this.values()['isActive'] ?? '';
    return value === 'true' ? 'Sí' : value === 'false' ? 'No' : 'Todos';
  });

  set(key: string, value: string): void {
    this.valuesChange.emit({ ...this.values(), [key]: value });
  }

  setPrice(range: { priceMin: string; priceMax: string }): void {
    this.valuesChange.emit({ ...this.values(), priceMin: range.priceMin, priceMax: range.priceMax });
  }

  /** Todos -> Sí -> No -> Todos */
  cycleActive(): void {
    const current = this.values()['isActive'] ?? '';
    const next = current === '' ? 'true' : current === 'true' ? 'false' : '';
    this.set('isActive', next);
  }

  valueOf(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}