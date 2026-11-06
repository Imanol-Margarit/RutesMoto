import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BrandLogo } from '../brand-logo/brand-logo';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, BrandLogo],
  template: `
    <!-- Fondo oscuro en móvil: cierra el menú al pulsarlo -->
    @if (open()) {
      <div class="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" (click)="closed.emit()"></div>
    }

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sage/70 bg-mint transition-transform duration-200 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0"
      [class.-translate-x-full]="!open()"
      [class.translate-x-0]="open()"
    >
      <a routerLink="/routes" (click)="closed.emit()" class="flex h-16 items-center gap-3 border-b border-sage/60 px-5">
        <app-brand-logo />
        <div class="leading-tight">
          <p class="text-base font-bold tracking-tight text-slate-900">Motoruta</p>
          <p class="text-[11px] uppercase tracking-[0.14em] text-teal-800/80">Panel</p>
        </div>
      </a>

      <nav class="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        <!-- Gestión: solo admin y host -->
        @if (canManageUsers()) {
          <div>
            <p class="section-label">Gestión</p>
            <ul class="space-y-1">
              <li><a routerLink="/routes" routerLinkActive="nav-link-active" (click)="closed.emit()" class="nav-link block">Rutas</a></li>
              <li><a routerLink="/departures" routerLinkActive="nav-link-active" (click)="closed.emit()" class="nav-link block">Salidas</a></li>
              <li><a routerLink="/hosts" routerLinkActive="nav-link-active" (click)="closed.emit()" class="nav-link block">Guías</a></li>
              <li><a routerLink="/categories" routerLinkActive="nav-link-active" (click)="closed.emit()" class="nav-link block">Categorías</a></li>
              <li><a routerLink="/locations" routerLinkActive="nav-link-active" (click)="closed.emit()" class="nav-link block">Localizaciones</a></li>
              <li><a routerLink="/users" routerLinkActive="nav-link-active" (click)="closed.emit()" class="nav-link block">Usuarios</a></li>
              <li><a routerLink="/roles" routerLinkActive="nav-link-active" (click)="closed.emit()" class="nav-link block">Roles</a></li>
            </ul>
          </div>
        }

        <div>
          <p class="section-label">Cuenta</p>
          <ul class="space-y-1">
            <li><a routerLink="/profile" routerLinkActive="nav-link-active" (click)="closed.emit()" class="nav-link block">Mi perfil</a></li>
          </ul>
        </div>
      </nav>

      <p class="border-t border-sage/60 px-5 py-4 text-xs text-slate-500">Rutas, salidas y guías en moto</p>
    </aside>
  `
})
export class Sidebar {
  open = input(false);
  canManageUsers = input(false);
  closed = output<void>();
}
