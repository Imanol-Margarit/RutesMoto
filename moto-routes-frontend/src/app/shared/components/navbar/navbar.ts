import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { AuthStore } from '../../../auth/auth.store';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-sage/70 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <!-- Izquierda: menú móvil y título -->
      <div class="flex flex-1 items-center gap-2">
        <button type="button" (click)="menuToggle.emit()" aria-label="Abrir menú"
                class="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <a routerLink="/shop" class="text-sm font-semibold text-slate-700 lg:hidden">Motoruta</a>
      </div>

      <!-- Centro: acceso a la tienda -->
      <nav class="hidden items-center gap-2 sm:flex">
        <a routerLink="/shop" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="nav-link-active" class="nav-link">Inicio</a>
        <a routerLink="/shop/rutas" routerLinkActive="nav-link-active" class="nav-link">Tienda</a>
      </nav>

      <!-- Derecha: usuario y cerrar sesión -->
      <div class="flex flex-1 items-center justify-end gap-3">
        <div class="flex items-center gap-3 rounded-xl px-2 py-1.5">
          @if (avatarUrl() && !avatarFailed()) {
            <img [src]="avatarUrl()" (error)="avatarFailed.set(true)" alt="" class="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
          } @else {
            <span class="grid h-9 w-9 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">{{ initials() }}</span>
          }
          <span class="hidden text-left leading-tight md:block">
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
  readonly avatarUrl = computed(() => this.authStore.user()?.avatarUrl ?? null);
  readonly avatarFailed = signal(false);
  readonly initials = computed(() => {
    const user = this.authStore.user();
    if (!user) return '';
    const source = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
    return source.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  });

  constructor() {
    // Si cambia la URL del avatar (al guardar el perfil), vuelve a intentar cargarla.
    effect(() => {
      this.avatarUrl();
      this.avatarFailed.set(false);
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}