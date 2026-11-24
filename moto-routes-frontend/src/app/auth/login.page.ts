import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrandLogo } from '../shared/components/brand-logo/brand-logo';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, BrandLogo],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-frost px-4 py-12">
      <div class="w-full max-w-md">
        <div class="mb-6 flex flex-col items-center text-center">
          <app-brand-logo size="lg" />
          <h1 class="mt-4 text-3xl font-bold tracking-tight text-slate-900">Motoruta</h1>
          <p class="page-eyebrow mt-2">Accede a tu cuenta</p>
        </div>

        <section class="card !p-7">
          <h2 class="mb-5 text-lg font-semibold text-slate-900">Iniciar sesión</h2>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-4">
            <div>
              <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input id="email" formControlName="email" type="email" autocomplete="username" class="input" />
              @if (form.controls.email.invalid && form.controls.email.touched) {
                <p class="error">Introduce un email válido.</p>
              }
            </div>

            <div>
              <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
              <input id="password" formControlName="password" type="password" autocomplete="current-password" class="input" />
              @if (form.controls.password.invalid && form.controls.password.touched) {
                <p class="error">La contraseña es obligatoria.</p>
              }
            </div>

            <button type="submit" [disabled]="submitting()" class="btn-primary w-full !py-2.5">
              {{ submitting() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <p class="mt-5 text-center text-sm text-slate-600">
            ¿No tienes cuenta?
            <a routerLink="/register" [queryParams]="returnUrlParams()" class="font-semibold text-teal-800 hover:underline">Regístrate</a>
          </p>
        </section>
      </div>
    </main>
  `
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);

  /** Mantiene el returnUrl al pasar de login a registro. */
  returnUrlParams(): Record<string, string> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl ? { returnUrl } : {};
  }

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor() {
    // Si ya hay sesión válida, no hace falta volver a entrar.
    if (this.authStore.isAuthenticated()) {
      void this.router.navigate([this.authStore.isAdmin() ? '/routes' : '/shop']);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const raw = this.form.getRawValue();
      await this.authService.login({ email: raw.email.trim(), password: raw.password });

      const defaultUrl = this.authStore.isAdmin() ? '/routes' : '/shop';
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || defaultUrl;
      await this.router.navigateByUrl(returnUrl);
    } catch {
      // El interceptor de errores ya muestra el motivo (credenciales incorrectas, etc.).
    } finally {
      this.submitting.set(false);
    }
  }
}
