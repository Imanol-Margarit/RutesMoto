import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Mensaje cuando una lista no tiene elementos, con acción opcional. */
@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
      <h3 class="mb-1 text-lg font-semibold text-slate-700">{{ heading() }}</h3>
      <p class="text-sm text-slate-500">{{ message() }}</p>
      @if (actionLabel() && actionLink()) {
        <a
          [routerLink]="actionLink()"
          class="mt-5 inline-block rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          {{ actionLabel() }}
        </a>
      }
    </div>
  `
})
export class EmptyState {
  heading = input('No hay elementos');
  message = input('');
  actionLabel = input<string | null>(null);
  actionLink = input<string | null>(null);
}
