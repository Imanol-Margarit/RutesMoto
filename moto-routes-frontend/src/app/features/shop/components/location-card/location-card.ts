import { Component, input, output } from '@angular/core';
import { ShopLocation } from '../../../../core/models/shop.model';

@Component({
  selector: 'app-location-card',
  template: `
    <button type="button" (click)="selected.emit(location().slug)"
            class="card flex h-full w-full flex-col justify-between text-left transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
      <span class="page-eyebrow">{{ location().country }}</span>
      <span class="mt-6 text-lg font-semibold text-slate-900">{{ location().city }}</span>
      @if (location().region) {
        <span class="text-sm text-slate-500">{{ location().region }}</span>
      }
      <span class="mt-4 text-sm font-semibold text-teal-700">Rutas en {{ location().city }} →</span>
    </button>
  `
})
export class LocationCard {
  location = input.required<ShopLocation>();
  selected = output<string>();
}
