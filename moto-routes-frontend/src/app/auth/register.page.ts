import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrandLogo } from '../shared/components/brand-logo/brand-logo';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';

/** Las dos contraseñas deben coincidir (validador del grupo). */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

/** Registro público de clientes (rol user). Al terminar, la sesión queda iniciada. */
@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, BrandLogo],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-frost px-4 py-12">
      <div class="w-full max-w-md">
        <div class="mb-6 flex flex-col items-center text-center">
          <app-brand-logo size="lg" />
          <h1 class="mt-4 text-3xl font-bold tracking-tight text-slate-900">Motoruta</h1>
          <p class="page-eyebrow mt-2">Crea tu cuenta</p>
        </div>

        <section class="card !p-7">
          <h2 class="mb-5 text-lg font-semibold text-slate-900">Registro</h2>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="firstName" class="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
                <input id="firstName" formControlName="firstName" type="text" autocomplete="given-name" class="input" />
                @if (form.controls.firstName.invalid && form.controls.firstName.touched) {
                  <p class="error">El nombre es obligatorio (máx. 100).</p>
                }
              </div>

              <div>
                <label for="lastName" class="mb-1 block text-sm font-medium text-slate-700">Apellidos</label>
                <input id="lastName" formControlName="lastName" type="text" autocomplete="family-name" class="input" />
                @if (form.controls.lastName.invalid && form.controls.lastName.touched) {
                  <p class="error">Los apellidos son obligatorios (máx. 150).</p>
                }
              </div>
            </div>

            <div>
              <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input id="email" formControlName="email" type="email" autocomplete="email" class="input" />
              @if (form.controls.email.invalid && form.controls.email.touched) {
                <p class="error">Introduce un email válido.</p>
              }
            </div>

            <div>
              <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
              <input id="password" formControlName="password" type="password" autocomplete="new-password" class="input" />
              @if (form.controls.password.invalid && form.controls.password.touched) {
                <p class="error">Mínimo 8 caracteres.</p>
              }
            </div>

            <div>
              <label for="confirmPassword" class="mb-1 block text-sm font-medium text-slate-700">Repite la contraseña</label>
              <input id="confirmPassword" formControlName="confirmPassword" type="password" autocomplete="new-password" class="input" />
              @if (form.hasError('passwordsMismatch') && form.controls.confirmPassword.touched) {
                <p class="error">Las contraseñas no coinciden.</p>
              }
            </div>

            <button type="submit" [disabled]="submitting()" class="btn-primary w-full !py-2.5">
              {{ submitting() ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="mt-5 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="font-semibold text-teal-800 hover:underline">Inicia sesión</a>
          </p>
        </section>
      </div>
    </main>
  `
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  constructor() {
    // Con sesión iniciada no tiene sentido registrarse.
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
      await this.authService.register({
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        email: raw.email.trim(),
        password: raw.password
      });

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/shop';
      await this.router.navigateByUrl(returnUrl);
    } catch {
      // El interceptor de errores ya muestra el motivo (email repetido, validación...).
    } finally {
      this.submitting.set(false);
    }
  }
}
