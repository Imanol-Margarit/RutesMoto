import { Component, effect, input, output, signal } from '@angular/core';

/** Slider de precio mínimo y máximo. Se actualiza mientras se arrastra y emite al soltar. */
@Component({
  selector: 'app-price-range',
  template: `
    <div class="card grid gap-6 md:grid-cols-2">
      <div>
        <div class="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Precio mínimo</span>
          <span class="text-sm normal-case text-slate-900">{{ low() }} €</span>
        </div>
        <input type="range" class="w-full accent-teal-700" min="0" [max]="max" step="5"
               [value]="low()" (input)="low.set(numberOf($event))" (change)="emit()"
               aria-label="Precio mínimo" />
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Precio máximo</span>
          <span class="text-sm normal-case text-slate-900">{{ high() >= max ? 'Sin límite' : high() + ' €' }}</span>
        </div>
        <input type="range" class="w-full accent-teal-700" min="0" [max]="max" step="5"
               [value]="high()" (input)="high.set(numberOf($event))" (change)="emit()"
               aria-label="Precio máximo" />
      </div>
    </div>
  `
})
export class PriceRange {
  priceMin = input<string>('');
  priceMax = input<string>('');
  readonly max = 300;

  rangeChange = output<{ priceMin: string; priceMax: string }>();

  readonly low = signal(0);
  readonly high = signal(300);

  constructor() {
    // Cuando cambia la URL (o se limpian los filtros), el slider se coloca en esos valores.
    effect(() => {
      this.low.set(Number(this.priceMin()) || 0);
      this.high.set(Number(this.priceMax()) || this.max);
    });
  }

  numberOf(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
  }

  emit(): void {
    if (this.low() > this.high()) this.low.set(this.high());
    this.rangeChange.emit({
      priceMin: this.low() > 0 ? String(this.low()) : '',
      priceMax: this.high() < this.max ? String(this.high()) : ''
    });
  }
}
