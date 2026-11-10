import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { AuthStore } from '../../auth/auth.store';
import { BrandLogo } from '../../shared/components/brand-logo/brand-logo';

@Component({
  selector: 'app-shop-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrandLogo],
  template: `
    <div class="flex min-h-screen flex-col bg-frost">
      <header class="sticky top-0 z-30 border-b border-sage/70 bg-mint/90 backdrop-blur">
        <div class="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <!-- El logo lleva siempre a Inicio -->
          <a routerLink="/shop" class="flex items-center gap-3 justify-self-start">
            <app-brand-logo />
            <div class="leading-tight">
              <p class="text-base font-bold tracking-tight text-slate-900">Motoruta</p>
              <p class="text-[11px] uppercase tracking-[0.14em] text-teal-800/80">Rutas y salidas</p>
            </div>
          </a>

          <!-- Inicio y Tienda en todas las pantallas -->
          <nav class="flex items-center gap-2">
            <a routerLink="/shop" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="nav-link-active" class="nav-link">Inicio</a>
            <a routerLink="/shop/rutas" routerLinkActive="nav-link-active" class="nav-link">Tienda</a>
          </nav>

          <div class="flex items-center gap-2 justify-self-end">
            @if (isAuthenticated()) {
              @if (canWrite()) {
                <a routerLink="/routes" class="btn-secondary !py-1.5 text-sm">Panel</a>
              }
              <a routerLink="/profile" class="btn-secondary !py-1.5 text-sm">Mi perfil</a>
              <button type="button" (click)="logout()" class="btn-primary !py-1.5 text-sm">Cerrar sesión</button>
            } @else {
              <a routerLink="/login" class="btn-primary !py-2 text-sm">Iniciar sesión</a>
            }
          </div>
        </div>
      </header>

      <main class="flex-1">
        <router-outlet />
      </main>

      <footer class="border-t border-sage/60 bg-white/60">
        <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span class="font-medium text-slate-600">Motoruta · Rutas y salidas en moto</span>
          <span>Las salidas se reservan desde la ficha de cada ruta</span>
        </div>
      </footer>
    </div>
  `
})
export class ShopLayout {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());
  readonly canWrite = computed(() => this.authStore.canWrite());

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/shop']);
  }
}
