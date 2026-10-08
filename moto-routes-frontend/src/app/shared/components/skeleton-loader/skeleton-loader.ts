import { Component, input, computed } from '@angular/core';
//ara mateixa no es usa este skeleton perque esta en files 
@Component({
  selector: 'app-skeleton-loader',
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      @for (item of items(); track $index) {
        <div class="animate-pulse">
          <div class="bg-gray-200 rounded-xl aspect-[4/3]"></div>
          <div class="mt-3 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class SkeletonLoader {
  count = input<number>(8);
  readonly items = computed(() => Array(this.count()).fill(0));
}