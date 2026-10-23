import { Component, computed, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Category, CategoryPayload } from '../../../../core/models/category.model';

/** Rechaza textos que solo tienen espacios. */
const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;

/** Formulario reactivo para crear y editar categorías. El estado activo solo aparece al editar. */
@Component({
  selector: 'app-category-form',
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
        <label for="description" class="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
        <textarea id="description" formControlName="description" rows="3" class="input"></textarea>
        <div class="mt-1 flex justify-between text-xs">
          @if (showError('description')) {
            <p class="error">{{ errorMessage('description') }}</p>
          } @else {
            <span></span>
          }
          <span class="text-slate-400">{{ form.controls.description.value.length }}/500</span>
        </div>
      </div>

      @if (isEditing()) {
        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" formControlName="isActive" class="accent-teal-700" />
          Categoría activa
        </label>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" (click)="cancelled.emit()" class="btn-secondary">Cancelar</button>
        <button type="submit" [disabled]="isSaving()" class="btn-primary">
          {{ isEditing() ? 'Guardar cambios' : 'Crear categoría' }}
        </button>
      </div>
    </form>
  `
})
export class CategoryForm {
  category = input<Category | null>(null);
  isSaving = input(false);
  submitted = output<CategoryPayload>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly isEditing = computed(() => this.category() !== null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, notBlank, Validators.maxLength(60)]],
    description: ['', Validators.maxLength(500)],
    isActive: [true]
  });

  constructor() {
    effect(() => {
      const category = this.category();
      if (category) {
        this.form.reset({
          name: category.name,
          description: category.description ?? '',
          isActive: category.isActive
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
    const payload: CategoryPayload = {
      name: raw.name.trim(),
      description: raw.description.trim() || null
    };

    if (this.isEditing()) {
      payload.isActive = raw.isActive;
    }

    this.submitted.emit(payload);
  }
}
