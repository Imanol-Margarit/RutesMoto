import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Loader],
  template: `
    <div class="min-h-screen bg-frost">
      <app-navbar />
      <app-loader />
      <main>
        <router-outlet />
      </main>
    </div>
  `
})
export class MainLayout {}
