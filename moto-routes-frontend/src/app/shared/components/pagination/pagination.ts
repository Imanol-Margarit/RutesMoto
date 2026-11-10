import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-2" aria-label="Paginación">
        <button type="button" class="btn-secondary !py-1.5 text-sm" [disabled]="page() <= 1" (click)="pageChange.emit(page() - 1)">
          Anterior
        </button>
        @for (item of pages(); track item) {
          <button type="button"
                  class="min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium"
                  [class.bg-teal-700]="item === page()"
                  [class.text-white]="item === page()"
                  [class.text-slate-700]="item !== page()"
                  [class.hover:bg-slate-100]="item !== page()"
                  (click)="pageChange.emit(item)">
            {{ item }}
          </button>
        }
        <button type="button" class="btn-secondary !py-1.5 text-sm" [disabled]="page() >= totalPages()" (click)="pageChange.emit(page() + 1)">
          Siguiente
        </button>
      </nav>
    }
  `
})
export class Pagination {
  page = input(1);
  totalPages = input(1);
  pageChange = output<number>();

  /** Página actual con vecinos; el resto se elide para no llenar la barra. */
  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const from = Math.max(1, current - 2);
    const to = Math.min(total, current + 2);
    const list: number[] = [];
    for (let i = from; i <= to; i++) list.push(i);
    return list;
  });
}
