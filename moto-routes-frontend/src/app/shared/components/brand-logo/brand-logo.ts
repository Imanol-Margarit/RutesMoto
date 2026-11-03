import { Component, input } from '@angular/core';

/** Logo de Motoruta: una carretera que serpentea sobre un fondo teal. */
@Component({
  selector: 'app-brand-logo',
  template: `
    <span class="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 shadow-sm"
          [class]="sizeClass()">
      <svg viewBox="0 0 32 32" class="h-[62%] w-[62%]" fill="none" aria-hidden="true">
        <path d="M6 28 C 6 20, 26 22, 26 14 S 10 8, 10 2"
              stroke="#ccf0e8" stroke-width="3.2" stroke-linecap="round" fill="none"/>
        <path d="M6 28 C 6 20, 26 22, 26 14 S 10 8, 10 2"
              stroke="#0f766e" stroke-width="0.9" stroke-dasharray="2.2 2.6" stroke-linecap="round" fill="none"/>
        <circle cx="10" cy="2.6" r="2.4" fill="#c0e2c3"/>
      </svg>
    </span>
  `
})
export class BrandLogo {
  size = input<'sm' | 'lg'>('sm');

  sizeClass(): string {
    return this.size() === 'lg' ? 'h-16 w-16' : 'h-9 w-9';
  }
}
