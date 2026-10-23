import { Component, computed, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  DIFFICULTY_OPTIONS,
  MotoRoute,
  RouteDifficulty,
  RoutePayload,
  RouteStatus,
  RouteSurface,
  STATUS_OPTIONS,
  SURFACE_OPTIONS
} from '../../../../core/models/route.model';

/** Rechaza textos que solo tienen espacios. */
const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;

/** Formulario reactivo para crear y editar rutas. Estado y activo solo aparecen al editar. */
@Component({
  selector: 'app-route-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">
      <div>
        <label for="title" class="mb-1 block text-sm font-medium text-slate-700">Título</label>
        <input id="title" formControlName="title" type="text" class="input" />
        @if (showError('title')) {
          <p class="error">{{ errorMessage('title') }}</p>
        }
      </div>

      <div>
        <label for="description" class="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
        <textarea id="description" formControlName="description" rows="4" class="input"></textarea>
        <div class="mt-1 flex justify-between text-xs">
          @if (showError('description')) {
            <p class="error">{{ errorMessage('description') }}</p>
          } @else {
            <span></span>
          }
          <span class="text-slate-400">{{ form.controls.description.value.length }}/500</span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label for="distanceKm" class="mb-1 block text-sm font-medium text-slate-700">Distancia (km)</label>
          <input id="distanceKm" formControlName="distanceKm" type="number" min="0" step="0.1" class="input" />
          @if (showError('distanceKm')) {
            <p class="error">{{ errorMessage('distanceKm') }}</p>
          }
        </div>

        <div>
          <label for="difficulty" class="mb-1 block text-sm font-medium text-slate-700">Dificultad</label>
          <select id="difficulty" formControlName="difficulty" class="input">
            @for (option of difficulties; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </div>

        <div>
          <label for="surface" class="mb-1 block text-sm font-medium text-slate-700">Firme</label>
          <select id="surface" formControlName="surface" class="input">
            @for (option of surfaces; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="startPoint" class="mb-1 block text-sm font-medium text-slate-700">Punto de salida</label>
          <input id="startPoint" formControlName="startPoint" type="text" class="input" />
          @if (showError('startPoint')) {
            <p class="error">{{ errorMessage('startPoint') }}</p>
          }
        </div>

        <div>
          <label for="estimatedMinutes" class="mb-1 block text-sm font-medium text-slate-700">
            Duración estimada (minutos)
          </label>
          <input id="estimatedMinutes" formControlName="estimatedMinutes" type="number" min="1" step="1" class="input" />
          @if (showError('estimatedMinutes')) {
            <p class="error">{{ errorMessage('estimatedMinutes') }}</p>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label for="hostId" class="mb-1 block text-sm font-medium text-slate-700">Guía</label>
          <select id="hostId" formControlName="hostId" class="input">
            <option [ngValue]="null">Sin guía</option>
            @for (host of hosts(); track host._id) {
              <option [ngValue]="host._id">{{ host.name }}</option>
            }
          </select>
        </div>

        <div>
          <label for="categoryId" class="mb-1 block text-sm font-medium text-slate-700">Categoría</label>
          <select id="categoryId" formControlName="categoryId" class="input">
            <option [ngValue]="null">Sin categoría</option>
            @for (category of categories(); track category._id) {
              <option [ngValue]="category._id">{{ category.name }}</option>
            }
          </select>
        </div>

        <div>
          <label for="locationId" class="mb-1 block text-sm font-medium text-slate-700">Localización</label>
          <select id="locationId" formControlName="locationId" class="input">
            <option [ngValue]="null">Sin localización</option>
            @for (location of locations(); track location._id) {
              <option [ngValue]="location._id">{{ location.city }}</option>
            }
          </select>
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
            Ruta activa
          </label>
        </div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" (click)="cancelled.emit()" class="btn-secondary">Cancelar</button>
        <button type="submit" [disabled]="isSaving()" class="btn-primary">
          {{ isEditing() ? 'Guardar cambios' : 'Crear ruta' }}
        </button>
      </div>
    </form>
  `
})
export class RouteForm {
  route = input<MotoRoute | null>(null);
  isSaving = input(false);

  // Listas para los selects. Por ahora llegan vacías: sin endpoints, solo aparece "Sin …".
  hosts = input<{ _id: string; name: string }[]>([]);
  categories = input<{ _id: string; name: string }[]>([]);
  locations = input<{ _id: string; city: string }[]>([]);

  submitted = output<RoutePayload>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly difficulties = DIFFICULTY_OPTIONS;
  readonly surfaces = SURFACE_OPTIONS;
  readonly statuses = STATUS_OPTIONS;
  readonly isEditing = computed(() => this.route() !== null);

  // Las reglas replican las del backend (Zod): título ≤ 120, descripción ≤ 500, distancia 0–9999.99...
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, notBlank, Validators.maxLength(120)]],
    distanceKm: [0, [Validators.required, Validators.min(0), Validators.max(9999.99)]],
    difficulty: ['media' as RouteDifficulty, Validators.required],
    surface: ['asfalto' as RouteSurface, Validators.required],
    description: ['', Validators.maxLength(500)],
    startPoint: ['', Validators.maxLength(200)],
    estimatedMinutes: new FormControl<number | null>(null, Validators.min(1)),
    hostId: new FormControl<string | null>(null),
    categoryId: new FormControl<string | null>(null),
    locationId: new FormControl<string | null>(null),
    status: ['publicada' as RouteStatus],
    isActive: [true]
  });

  constructor() {
    effect(() => {
      const route = this.route();
      if (route) {
        this.form.reset({
          title: route.title,
          distanceKm: route.distanceKm,
          difficulty: route.difficulty,
          surface: route.surface,
          description: route.description ?? '',
          startPoint: route.startPoint ?? '',
          estimatedMinutes: route.estimatedMinutes,
          hostId: route.hostId,
          categoryId: route.categoryId,
          locationId: route.locationId,
          status: route.status,
          isActive: route.isActive
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
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}.`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}.`;
    return 'Valor no válido.';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: RoutePayload = {
      title: raw.title.trim(),
      distanceKm: Number(raw.distanceKm),
      difficulty: raw.difficulty,
      surface: raw.surface,
      description: raw.description.trim() || null,
      startPoint: raw.startPoint.trim() || null,
      estimatedMinutes: raw.estimatedMinutes,
      hostId: raw.hostId,
      categoryId: raw.categoryId,
      locationId: raw.locationId
    };

    if (this.isEditing()) {
      payload.status = raw.status;
      payload.isActive = raw.isActive;
    }

    this.submitted.emit(payload);
  }
}