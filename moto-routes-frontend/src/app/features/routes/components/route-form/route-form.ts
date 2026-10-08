import { Component, computed, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  DIFFICULTY_LABELS,
  MotoRoute,
  ROUTE_DIFFICULTIES,
  ROUTE_STATUSES,
  RouteDifficulty,
  RoutePayload,
  RouteStatus,
  STATUS_LABELS
} from '../../../../core/models/route.model';

/** Igual que required, pero también rechaza textos que son solo espacios. */
const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;

@Component({
  selector: 'app-route-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
      <div>
        <label for="title" class="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <input id="title" formControlName="title" type="text"
               class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        @if (isInvalid('title')) {
          <p class="mt-1 text-xs text-red-600">{{ getError('title') }}</p>
        }
      </div>

      <div>
        <label for="description" class="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea id="description" formControlName="description" rows="4"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"></textarea>
        <div class="mt-1 flex items-start justify-between gap-2">
          @if (isInvalid('description')) {
            <p class="text-xs text-red-600">{{ getError('description') }}</p>
          } @else {
            <span></span>
          }
          <span class="text-xs text-slate-400">{{ descriptionLength() }}/500</span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label for="region" class="mb-1 block text-sm font-medium text-slate-700">Region</label>
          <input id="region" formControlName="region" type="text"
                 class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          @if (isInvalid('region')) {
            <p class="mt-1 text-xs text-red-600">{{ getError('region') }}</p>
          }
        </div>

        <div>
          <label for="difficulty" class="mb-1 block text-sm font-medium text-slate-700">Difficulty</label>
          <select id="difficulty" formControlName="difficulty"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
            @for (difficulty of difficulties; track difficulty) {
              <option [value]="difficulty">{{ difficultyLabels[difficulty] }}</option>
            }
          </select>
        </div>

        <div>
          <label for="distanceKm" class="mb-1 block text-sm font-medium text-slate-700">Distance (km)</label>
          <input id="distanceKm" formControlName="distanceKm" type="number" min="0" step="0.1"
                 class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          @if (isInvalid('distanceKm')) {
            <p class="mt-1 text-xs text-red-600">{{ getError('distanceKm') }}</p>
          }
        </div>
      </div>

      @if (editMode()) {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label for="status" class="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select id="status" formControlName="status"
                    class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              @for (status of statuses; track status) {
                <option [value]="status">{{ statusLabels[status] }}</option>
              }
            </select>
          </div>
        </div>
      }

      <label class="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700">
        <input type="checkbox" formControlName="isActive" class="accent-teal-700" />
        Active
      </label>

      <div class="flex items-center justify-end gap-2 pt-2">
        <button type="button" (click)="cancelClick.emit()"
                class="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" [disabled]="isLoading()"
                class="rounded-xl bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800 disabled:opacity-50">
          {{ editMode() ? 'Update route' : 'Create route' }}
        </button>
      </div>
    </form>
  `
})
export class RouteForm {
  route = input<MotoRoute | null>(null);
  isLoading = input(false);
  formSubmit = output<RoutePayload>();
  cancelClick = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly difficulties = ROUTE_DIFFICULTIES;
  readonly statuses = ROUTE_STATUSES;
  readonly difficultyLabels = DIFFICULTY_LABELS;
  readonly statusLabels = STATUS_LABELS;
  readonly editMode = computed(() => !!this.route());

  // Las reglas replican el schema Zod del backend (título ≤ 120, región ≤ 80,
  // descripción ≤ 500, distancia ≥ 0 y NUMERIC(6,2) → máximo 9999.99).
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, notBlank, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(500)]],
    region: ['', [Validators.required, notBlank, Validators.maxLength(80)]],
    difficulty: ['media' as RouteDifficulty, [Validators.required]],
    distanceKm: [0, [Validators.required, Validators.min(0), Validators.max(9999.99)]],
    status: ['publicada' as RouteStatus, [Validators.required]],
    isActive: [true]
  });

  constructor() {
    effect(() => {
      const route = this.route();

      if (!route) {
        this.form.reset({
          title: '',
          description: '',
          region: '',
          difficulty: 'media',
          distanceKm: 0,
          status: 'publicada',
          isActive: true
        });
        return;
      }

      this.form.patchValue({
        title: route.title,
        description: route.description ?? '',
        region: route.region,
        difficulty: route.difficulty,
        distanceKm: route.distanceKm,
        status: route.status,
        isActive: route.isActive
      });
    });
  }

  descriptionLength(): number {
    return this.form.controls.description.value.length;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control.touched || control.dirty));
  }

  getError(field: string): string {
    const errors = this.form.get(field)?.errors;
    if (!errors) return '';
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
    const description = raw.description.trim();

    this.formSubmit.emit({
      title: raw.title.trim(),
      region: raw.region.trim(),
      distanceKm: Number(raw.distanceKm),
      difficulty: raw.difficulty,
      description: description === '' ? null : description,
      status: raw.status,
      isActive: raw.isActive
    });
  }
}
