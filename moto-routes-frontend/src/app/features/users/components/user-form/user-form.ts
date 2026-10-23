import { Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Role } from '../../../../core/models/role.model';
import { User, UserPayload } from '../../../../core/models/user.model';

/** Formulario reactivo para crear y editar usuarios. La contraseña solo es obligatoria al crear. */
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="firstName" class="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
          <input id="firstName" formControlName="firstName" type="text" class="input" />
          @if (showError('firstName')) {
            <p class="error">{{ errorMessage('firstName') }}</p>
          }
        </div>

        <div>
          <label for="lastName" class="mb-1 block text-sm font-medium text-slate-700">Apellidos</label>
          <input id="lastName" formControlName="lastName" type="text" class="input" />
          @if (showError('lastName')) {
            <p class="error">{{ errorMessage('lastName') }}</p>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input id="email" formControlName="email" type="email" class="input" />
          @if (showError('email')) {
            <p class="error">{{ errorMessage('email') }}</p>
          }
        </div>

        <div>
          <label for="roleId" class="mb-1 block text-sm font-medium text-slate-700">Rol</label>
          <select id="roleId" formControlName="roleId" class="input">
            <option value="" disabled>Selecciona un rol</option>
            @for (role of roles(); track role._id) {
              <option [value]="role._id">{{ role.name }}</option>
            }
          </select>
          @if (showError('roleId')) {
            <p class="error">{{ errorMessage('roleId') }}</p>
          }
        </div>
      </div>

      @if (isCreateMode()) {
        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
          <input id="password" formControlName="password" type="password" class="input" />
          @if (showError('password')) {
            <p class="error">{{ errorMessage('password') }}</p>
          }
        </div>
      } @else {
        <div>
          <label for="newPassword" class="mb-1 block text-sm font-medium text-slate-700">Nueva contraseña (opcional)</label>
          <input id="newPassword" formControlName="password" type="password" class="input" placeholder="Déjala vacía para no cambiarla" />
          @if (showError('password')) {
            <p class="error">{{ errorMessage('password') }}</p>
          }
        </div>
      }

      <div>
        <label for="avatarUrl" class="mb-1 block text-sm font-medium text-slate-700">URL del avatar (opcional)</label>
        <input id="avatarUrl" formControlName="avatarUrl" type="url" placeholder="https://..." class="input" />
        @if (showError('avatarUrl')) {
          <p class="error">{{ errorMessage('avatarUrl') }}</p>
        }
      </div>

      @if (!isCreateMode()) {
        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" formControlName="isActive" class="accent-teal-700" />
          Usuario activo
        </label>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" (click)="cancelled.emit()" class="btn-secondary">Cancelar</button>
        <button type="submit" [disabled]="isSaving()" class="btn-primary">
          {{ isCreateMode() ? 'Crear usuario' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  `
})
export class UserForm {
  user = input<User | null>(null);
  roles = input<Role[]>([]);
  isSaving = input(false);
  submitted = output<UserPayload>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly isCreateMode = computed(() => this.user() === null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    roleId: ['', Validators.required],
    password: ['', Validators.minLength(8)],
    avatarUrl: ['', Validators.maxLength(500)],
    isActive: [true]
  });

  constructor() {
    effect(() => {
      const user = this.user();
      // En crear, la contraseña es obligatoria: se añade el validador.
      const password = this.form.controls.password;
      if (user === null) {
        password.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.reset({ firstName: '', lastName: '', email: '', roleId: '', password: '', avatarUrl: '', isActive: true });
      } else {
        password.setValidators([Validators.minLength(8)]);
        this.form.reset({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roleId: user.roleId,
          password: '',
          avatarUrl: user.avatarUrl ?? '',
          isActive: user.isActive
        });
      }
      password.updateValueAndValidity();
    });
  }

  showError(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  errorMessage(name: string): string {
    const errors: ValidationErrors = this.form.get(name)?.errors ?? {};
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['email']) return 'Introduce un email válido.';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
    if (errors['url']) return 'Introduce una URL válida.';
    return 'Valor no válido.';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: UserPayload = {
      roleId: raw.roleId,
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      email: raw.email.trim(),
      avatarUrl: raw.avatarUrl.trim() || null
    };

    if (raw.password) {
      payload.password = raw.password;
    }
    if (!this.isCreateMode()) {
      payload.isActive = raw.isActive;
    }

    this.submitted.emit(payload);
  }
}
