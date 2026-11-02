import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../../auth/auth.store';
import { AlertService } from '../../../../core/services/alert.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { ProfileResponse, ProfileUser } from '../../../../core/models/profile.model';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">Mi cuenta</p>
          <h1 class="text-2xl font-semibold text-slate-900">Perfil</h1>
          <p class="text-sm text-slate-500">Datos personales y de contacto.</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p class="text-sm font-semibold text-slate-900">{{ fullName() }}</p>
          <p class="text-xs text-slate-500">{{ user()?.email ?? '' }}</p>
          <p class="text-xs text-slate-400">Rol: {{ user()?.role ?? '' }}</p>
        </div>
      </header>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Cargando perfil...</div>
      } @else {
        <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-slate-900">Editar perfil</h2>

            <form [formGroup]="form" (ngSubmit)="save()" novalidate class="space-y-5">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="firstName" class="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
                  <input id="firstName" formControlName="firstName" type="text" class="input" />
                  @if (form.controls.firstName.invalid && form.controls.firstName.touched) {
                    <p class="error">Este campo es obligatorio (máximo 100 caracteres).</p>
                  }
                </div>

                <div>
                  <label for="lastName" class="mb-1 block text-sm font-medium text-slate-700">Apellidos</label>
                  <input id="lastName" formControlName="lastName" type="text" class="input" />
                  @if (form.controls.lastName.invalid && form.controls.lastName.touched) {
                    <p class="error">Este campo es obligatorio (máximo 150 caracteres).</p>
                  }
                </div>
              </div>

              <div>
                <label for="phone" class="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
                <input id="phone" formControlName="phone" type="text" class="input" />
                @if (form.controls.phone.invalid && form.controls.phone.touched) {
                  <p class="error">Máximo 30 caracteres.</p>
                }
              </div>

              <div>
                <label for="bio" class="mb-1 block text-sm font-medium text-slate-700">Biografía</label>
                <textarea id="bio" formControlName="bio" rows="4" class="input"></textarea>
                <div class="mt-1 flex justify-between text-xs">
                  @if (form.controls.bio.invalid && form.controls.bio.touched) {
                    <p class="error">Máximo 2000 caracteres.</p>
                  } @else {
                    <span></span>
                  }
                  <span class="text-slate-400">{{ form.controls.bio.value.length }}/2000</span>
                </div>
              </div>

              <div>
                <label for="avatarUrl" class="mb-1 block text-sm font-medium text-slate-700">URL del avatar</label>
                <input id="avatarUrl" formControlName="avatarUrl" type="url" placeholder="https://..." class="input" />
                @if (form.controls.avatarUrl.invalid && form.controls.avatarUrl.touched) {
                  <p class="error">Introduce una URL que empiece por http:// o https://</p>
                }
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button type="button" (click)="load()" class="btn-secondary">Deshacer</button>
                <button type="submit" [disabled]="saving()" class="btn-primary">
                  {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold text-slate-900">Vista previa</h2>
            <div class="space-y-3 text-sm text-slate-700">
              <div>
                <span class="block text-xs uppercase tracking-wide text-slate-400">Nombre completo</span>
                <p class="mt-1 font-medium text-slate-900">{{ fullName() }}</p>
              </div>
              <div>
                <span class="block text-xs uppercase tracking-wide text-slate-400">Email</span>
                <p class="mt-1">{{ user()?.email ?? '-' }}</p>
              </div>
              <div>
                <span class="block text-xs uppercase tracking-wide text-slate-400">Teléfono</span>
                <p class="mt-1">{{ form.controls.phone.value || '-' }}</p>
              </div>
              <div>
                <span class="block text-xs uppercase tracking-wide text-slate-400">Avatar</span>
                <p class="mt-1 break-all">{{ form.controls.avatarUrl.value || '-' }}</p>
              </div>
              <div>
                <span class="block text-xs uppercase tracking-wide text-slate-400">Biografía</span>
                <p class="mt-1 whitespace-pre-line text-slate-600">{{ form.controls.bio.value || 'Sin biografía todavía.' }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </section>
  `
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly alert = inject(AlertService);
  private readonly authStore = inject(AuthStore);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly user = signal<ProfileUser | null>(null);
  readonly fullName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}`.trim() : '';
  });

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(150)]],
    phone: ['', Validators.maxLength(30)],
    bio: ['', Validators.maxLength(2000)],
    avatarUrl: ['', Validators.pattern(/^https?:\/\/.+/)]
  });

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const response = await this.profileService.getMe();
      this.applyResponse(response.data);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);
    try {
      const response = await this.profileService.updateMe({
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        phone: raw.phone.trim() || null,
        bio: raw.bio.trim() || null,
        avatarUrl: raw.avatarUrl.trim() || null
      });

      this.applyResponse(response.data);
      this.authStore.updateUser({
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        email: response.data.user.email
      });
      await this.alert.toast('Perfil actualizado');
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  private applyResponse(data: ProfileResponse): void {
    this.user.set(data.user);
    this.form.reset({
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      phone: data.profile.phone ?? '',
      bio: data.profile.bio ?? '',
      avatarUrl: data.profile.avatarUrl ?? ''
    });
  }
}