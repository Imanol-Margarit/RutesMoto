import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
          <a
            routerLink="/routes"
            routerLinkActive="bg-leaf text-slate-900"
            class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900"
          >
            Rutas
          </a>
          <a
            routerLink="/departures"
            routerLinkActive="bg-leaf text-slate-900"
            class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900"
          >
            Salidas
          </a>
          <a
            routerLink="/hosts"
            routerLinkActive="bg-leaf text-slate-900"
            class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900"
          >
            Guías
          </a>
          <a
            routerLink="/categories"
            routerLinkActive="bg-leaf text-slate-900"
            class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900"
          >
            Categorías
          </a>
          <a
            routerLink="/locations"
            routerLinkActive="bg-leaf text-slate-900"
            class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900"
          >
            Localizaciones
          </a>
          <a
            routerLink="/users"
            routerLinkActive="bg-leaf text-slate-900"
            class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900"
          >
            Usuarios
          </a>
          <a
            routerLink="/roles"
            routerLinkActive="bg-leaf text-slate-900"
            class="rounded-lg px-3 py-2 text-slate-700 hover:bg-seafoam hover:text-slate-900"
          >
            Roles
          </a>
        </div>
      </div>
    </nav>
  `
})
export class Navbar {}
