import { Component, computed, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { HOST_STATUS_OPTIONS, Host, HostPayload, HostStatus } from '../../../../core/models/host.model';

/** Rechaza textos que solo tienen espacios. */
const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;

/** Formulario reactivo para crear y editar guías. Estado y activo solo aparecen al editar. */
@Component({
  selector: 'app-host-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">
      <div>
        <label for="name" class="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
        <input id="name" formControlName="name" type="text" class="input" />
        @if (showError('name')) {
          <p class="error">{{ errorMessage('name') }}</p>
        }
      </div>

      <div>
        <label for="biography" class="mb-1 block text-sm font-medium text-slate-700">Biografía</label>
        <textarea id="biography" formControlName="biography" rows="4" class="input"></textarea>
        <div class="mt-1 flex justify-between text-xs">
          @if (showError('biography')) {
            <p class="error">{{ errorMessage('biography') }}</p>
          } @else {
            <span></span>
          }
          <span class="text-slate-400">{{ form.controls.biography.value.length }}/1000</span>
        </div>
      </div>

      @if (isEditing()) {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="status" class="mb-1 block text-sm font-medium text-slate-700">Estado</label>
            <select id="status" formControlName="status" class="input">
              @for (option of statuses; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>

          <label class="flex items-end gap-2 pb-2 text-sm text-slate-700">
            <input type="checkbox" formControlName="isActive" class="accent-teal-700" />
            Guía activo
          </label>
        </div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" (click)="cancelled.emit()" class="btn-secondary">Cancelar</button>
        <button type="submit" [disabled]="isSaving()" class="btn-primary">
          {{ isEditing() ? 'Guardar cambios' : 'Crear guía' }}
        </button>
      </div>
    </form>
  `
})
export class HostForm {
  host = input<Host | null>(null);
  isSaving = input(false);
  submitted = output<HostPayload>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly statuses = HOST_STATUS_OPTIONS;
  readonly isEditing = computed(() => this.host() !== null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, notBlank, Validators.maxLength(100)]],
    biography: ['', Validators.maxLength(1000)],
    status: ['active' as HostStatus],
    isActive: [true]
  });

  constructor() {
    effect(() => {
      const host = this.host();
      if (host) {
        this.form.reset({
          name: host.name,
          biography: host.biography ?? '',
          status: host.status,
          isActive: host.isActive
        });
      } else {
        this.form.reset();
      }
    });
  }

  showError(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  errorMessage(name: string): string {
    const errors: ValidationErrors = this.form.get(name)?.errors ?? {};
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
    return 'Valor no válido.';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: HostPayload = {
      name: raw.name.trim(),
      biography: raw.biography.trim() || null
    };

    if (this.isEditing()) {
      payload.status = raw.status;
      payload.isActive = raw.isActive;
    }

    this.submitted.emit(payload);
  }
}
