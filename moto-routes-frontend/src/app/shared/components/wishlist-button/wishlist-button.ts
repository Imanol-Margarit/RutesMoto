import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/auth.store';
import { WishlistService } from '../../../core/services/wishlist.service';
import { WishlistStore } from '../../../core/stores/wishlist.store';

/**
 * Corazón para guardar / quitar una ruta de la lista de deseos.
 * - variant "full": botón con texto (detalle de la ruta).
 * - variant "icon": solo el icono redondo (encima de una tarjeta).
 * Sin sesión, lleva a /login y vuelve a la página actual.
 */
@Component({
  selector: 'app-wishlist-button',
  template: `
    <button type="button" (click)="toggle($event)" [disabled]="busy()"
            [attr.aria-pressed]="saved()"
            [attr.aria-label]="saved() ? 'Quitar de mi lista de deseos' : 'Guardar en mi lista de deseos'"
            [class]="variant() === 'icon'
              ? 'grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 disabled:opacity-60'
              : 'btn-secondary inline-flex items-center gap-2 !py-2 text-sm disabled:opacity-60'">
      <svg viewBox="0 0 24 24" class="h-5 w-5 transition" [class.text-rose-500]="saved()" [class.text-slate-500]="!saved()"
           [attr.fill]="saved() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.5 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.5 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </svg>
      @if (variant() === 'full') {
        <span>{{ saved() ? 'Guardada' : 'Guardar' }}</span>
      }
    </button>
  `
})
export class WishlistButton {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly wishlistService = inject(WishlistService);
  private readonly store = inject(WishlistStore);

  readonly slug = input.required<string>();
  readonly variant = input<'full' | 'icon'>('full');
  /** Emite el estado final (true = guardada) cuando cambia de verdad. */
  readonly changed = output<boolean>();

  readonly busy = signal(false);
  readonly saved = computed(() => this.store.slugs().has(this.slug()));

  async toggle(event: Event): Promise<void> {
    // Por si el botón está dentro de un enlace o una tarjeta clicable.
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      await this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const before = this.saved();
    this.busy.set(true);
    try {
      const after = await this.wishlistService.toggle(this.slug());
      if (after !== before) this.changed.emit(after);
    } finally {
      this.busy.set(false);
    }
  }
}
