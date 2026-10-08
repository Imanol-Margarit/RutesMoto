import { Injectable, signal, computed, inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly spinner = inject(NgxSpinnerService);
  private readonly _active = signal(0);
  readonly loading = computed(() => this._active() > 0);
  private cleanupTimeoutId: ReturnType<typeof setTimeout> | null = null;

  show(): void {
    if (this.cleanupTimeoutId) {
      clearTimeout(this.cleanupTimeoutId);
      this.cleanupTimeoutId = null;
    }

    this._active.update(n => n + 1);
    this.spinner.show('global-loader');
  }

  hide(): void {
    this._active.update(n => Math.max(0, n - 1));

    if (!this.loading()) {
      this.spinner.hide('global-loader');

      // Defensive fallback for rare cases where ngx-spinner leaves a stale full-screen overlay.
      this.cleanupTimeoutId = setTimeout(() => {
        this.spinner.hide('global-loader');
        this.spinner.hide();
        this.cleanupStaleOverlay();
        this.cleanupTimeoutId = null;
      }, 120);
    }
  }

  private cleanupStaleOverlay(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const staleOverlays = document.querySelectorAll<HTMLElement>('.ngx-spinner-overlay');

    staleOverlays.forEach(overlay => {
      if (overlay.style.display === 'none') {
        overlay.style.pointerEvents = 'none';
      }
    });
  }
}
