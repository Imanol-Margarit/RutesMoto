import { Component, input, output } from '@angular/core';
import { ShopHost } from '../../../../core/models/shop.model';

@Component({
  selector: 'app-host-card',
  template: `
    <button type="button" (click)="selected.emit(host().slug)"
            class="card-flush flex h-full w-full flex-col p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md">
      <span class="grid h-12 w-12 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">
        {{ initials() }}
      </span>
      <span class="mt-4 text-lg font-semibold text-slate-900">{{ host().name }}</span>
      @if (host().biography) {
        <span class="mt-2 line-clamp-3 text-sm text-slate-500">{{ host().biography }}</span>
      }
      <span class="mt-auto pt-4 text-sm font-semibold text-teal-700">Rutas de este guía →</span>
    </button>
  `
})
export class HostCard {
  host = input.required<ShopHost>();
  selected = output<string>();

  initials(): string {
    return this.host().name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  }
}
