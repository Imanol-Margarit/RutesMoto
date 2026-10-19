import { Component, input, output } from '@angular/core';

/** Muestra un error de carga con botón para reintentar. */
@Component({
  selector: 'app-error-state',
  template: `
    <div class="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <h3 class="mb-1 text-lg font-semibold text-red-800">Algo ha salido mal</h3>
      <p class="mb-5 text-sm text-red-700">{{ message() }}</p>
      <button
        type="button"
        (click)="retry.emit()"
        class="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        Reintentar
      </button>
    </div>
  `
})
export class ErrorState {
  message = input('No se pudieron cargar los datos.');
  retry = output<void>();
}
