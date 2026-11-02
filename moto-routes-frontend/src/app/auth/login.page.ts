import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="flex min-h-screen items-center justify-center bg-frost px-4">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
        <header class="mb-6 text-center">
          <span class="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white">
            MR
          </span>
          <h1 class="text-2xl font-semibold text-slate-900">Iniciar sesión</h1>
          <p class="mt-1 text-sm text-slate-500">Moto Routes</p>
        </header>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-4">
          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" formControlName="email" type="email" class="input" />
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <p class="error">Introduce un email válido.</p>
            }
          </div>

          <div>
            <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
            <input id="password" formControlName="password" type="password" class="input" />
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <p class="error">La contraseña es obligatoria.</p>
            }
          </div>

          <button type="submit" [disabled]="submitting()" class="btn-primary w-full">
            {{ submitting() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </section>
  `
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor() {
    // Si ya hay sesión válida, no hace falta volver a entrar.
    if (this.authStore.isAuthenticated()) void this.router.navigate(['/routes']);
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

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/routes';
      await this.router.navigateByUrl(returnUrl);
    } catch {
      // El interceptor de errores ya muestra el motivo (credenciales incorrectas, etc.).
    } finally {
      this.submitting.set(false);
    }
  }
}
