import { Component, ElementRef, ViewChild } from '@angular/core';

/** Carrusel horizontal: el contenido se proyecta y se desplaza con los botones o con el gesto del usuario. */
@Component({
  selector: 'app-carousel',
  template: `
    <div class="relative">
      <div class="mb-4 flex justify-end gap-2">
        <button type="button" class="btn-secondary !px-3 !py-1.5" (click)="scrollBy(-1)" aria-label="Anterior">←</button>
        <button type="button" class="btn-secondary !px-3 !py-1.5" (click)="scrollBy(1)" aria-label="Siguiente">→</button>
      </div>
      <div #track class="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3">
        <ng-content />
      </div>
    </div>
  `
})
export class Carousel {
  @ViewChild('track', { static: true }) track!: ElementRef<HTMLElement>;

  scrollBy(direction: number): void {
    const el = this.track.nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }
}
