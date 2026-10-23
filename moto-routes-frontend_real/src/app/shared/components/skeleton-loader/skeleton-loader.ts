import { Component, computed, input } from '@angular/core';

/** Placeholder animado mientras se cargan los datos. */
@Component({
  selector: 'app-skeleton-loader',
  template: `
    <div class="grid gap-3" aria-busy="true" aria-label="Cargando">
      @for (item of items(); track item) {
        <div class="h-14 animate-pulse rounded-xl bg-slate-200"></div>
      }
    </div>
  `
})
export class SkeletonLoader {
  rows = input(5);
  readonly items = computed(() => Array.from({ length: this.rows() }, (_, index) => index));
}
