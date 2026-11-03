import { Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { AuthStore } from '../../../auth/auth.store';

@Component({
  selector: 'app-navbar',
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-sage/70 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div class="flex items-center gap-2">
        <button type="button" (click)="menuToggle.emit()" aria-label="Abrir menú"
                class="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <span class="text-sm font-semibold text-slate-700 lg:hidden">Motoruta</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">{{ initials() }}</span>
          <span class="hidden text-left leading-tight sm:block">
            <span class="block text-sm font-semibold text-slate-900">{{ userLabel() }}</span>
            <span class="block text-[11px] uppercase tracking-wide text-slate-500">{{ roleLabel() }}</span>
          </span>
        </div>
        <button type="button" (click)="logout()" class="btn-secondary !px-3 !py-1.5 text-xs">
          Cerrar sesión
        </button>
      </div>
    </header>
  `
})
export class Navbar {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuToggle = output<void>();

  readonly userLabel = computed(() => {
    const user = this.authStore.user();
    if (!user) return '';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return fullName || user.email;
  });
  readonly roleLabel = computed(() => this.authStore.role() ?? '');
  readonly initials = computed(() => {
    const user = this.authStore.user();
    if (!user) return '';
    const source = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
    return source.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  });

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
