import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '../../auth/auth.store';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Sidebar],
  template: `
    <div class="flex min-h-screen bg-frost">
      <app-sidebar [open]="menuOpen()" [canManageUsers]="canManageUsers()" (closed)="menuOpen.set(false)" />

      <div class="flex min-w-0 flex-1 flex-col">
        <app-navbar (menuToggle)="menuOpen.set(!menuOpen())" />

        <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div class="mx-auto w-full max-w-[1600px]">
            <router-outlet />
          </div>
        </main>

        <footer class="border-t border-sage/60 bg-white/60 px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          Motoruta · Panel de administración
        </footer>
      </div>
    </div>
  `
})
export class MainLayout {
  private readonly authStore = inject(AuthStore);

  readonly menuOpen = signal(false);
  readonly canManageUsers = computed(() => this.authStore.canWrite());
}
