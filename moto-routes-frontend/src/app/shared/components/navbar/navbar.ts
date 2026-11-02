import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { AuthStore } from '../../../auth/auth.store';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-50 border-b border-sage bg-mint/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a routerLink="/routes" class="flex items-center gap-2">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white">
            MR
          </span>
          <span class="text-sm font-semibold tracking-wide text-slate-800">Moto Routes Admin</span>
        </a>

        <div class="flex items-center gap-2 text-sm">
          <a routerLink="/routes" routerLinkActive="bg-leaf text-slate-900" class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900">Rutas</a>
          <a routerLink="/departures" routerLinkActive="bg-leaf text-slate-900" class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900">Salidas</a>
          <a routerLink="/hosts" routerLinkActive="bg-leaf text-slate-900" class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900">Guías</a>
          <a routerLink="/categories" routerLinkActive="bg-leaf text-slate-900" class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900">Categorías</a>
          <a routerLink="/locations" routerLinkActive="bg-leaf text-slate-900" class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900">Localizaciones</a>
          @if (canManageUsers()) {
            <a routerLink="/users" routerLinkActive="bg-leaf text-slate-900" class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900">Usuarios</a>
          }
          <a routerLink="/roles" routerLinkActive="bg-leaf text-slate-900" class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900">Roles</a>
          <a routerLink="/profile" routerLinkActive="bg-leaf text-slate-900" class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900">Perfil</a>

          <span class="ml-2 rounded-lg bg-white/70 px-3 py-2 text-slate-700">{{ userLabel() }}</span>
          <button type="button" (click)="logout()" class="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100">
            Salir
          </button>
        </div>
      </div>
    </nav>
  `
})
export class Navbar {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userLabel = computed(() => {
    const user = this.authStore.user();
    if (!user) return '';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return fullName || user.email;
  });
  readonly roleLabel = computed(() => this.authStore.role() ?? '');
  readonly canManageUsers = computed(() => this.authStore.canWrite());

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
