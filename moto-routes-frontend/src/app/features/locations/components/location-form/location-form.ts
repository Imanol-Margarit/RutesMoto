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
import { LOCATION_STATUS_OPTIONS, Location, LocationPayload, LocationStatus } from '../../../../core/models/location.model';

/** Rechaza textos que solo tienen espacios. */
const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;

/** Formulario reactivo para crear y editar localizaciones. Estado y activa solo aparecen al editar. */
@Component({
  selector: 'app-location-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="city" class="mb-1 block text-sm font-medium text-slate-700">Ciudad</label>
          <input id="city" formControlName="city" type="text" class="input" />
          @if (showError('city')) {
            <p class="error">{{ errorMessage('city') }}</p>
          }
        </div>

        <div>
          <label for="country" class="mb-1 block text-sm font-medium text-slate-700">País</label>
          <input id="country" formControlName="country" type="text" class="input" />
          @if (showError('country')) {
            <p class="error">{{ errorMessage('country') }}</p>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="region" class="mb-1 block text-sm font-medium text-slate-700">Región</label>
          <input id="region" formControlName="region" type="text" class="input" />
          @if (showError('region')) {
            <p class="error">{{ errorMessage('region') }}</p>
          }
        </div>

        <div>
          <label for="postalCode" class="mb-1 block text-sm font-medium text-slate-700">Código postal</label>
          <input id="postalCode" formControlName="postalCode" type="text" class="input" />
          @if (showError('postalCode')) {
            <p class="error">{{ errorMessage('postalCode') }}</p>
          }
        </div>
      </div>

      <div>
        <label for="address" class="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
        <input id="address" formControlName="address" type="text" class="input" />
        @if (showError('address')) {
          <p class="error">{{ errorMessage('address') }}</p>
        }
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="latitude" class="mb-1 block text-sm font-medium text-slate-700">Latitud</label>
          <input id="latitude" formControlName="latitude" type="number" step="0.000001" min="-90" max="90" class="input" />
          @if (showError('latitude')) {
            <p class="error">{{ errorMessage('latitude') }}</p>
          }
        </div>

        <div>
          <label for="longitude" class="mb-1 block text-sm font-medium text-slate-700">Longitud</label>
          <input id="longitude" formControlName="longitude" type="number" step="0.000001" min="-180" max="180" class="input" />
          @if (showError('longitude')) {
            <p class="error">{{ errorMessage('longitude') }}</p>
          }
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
            Localización activa
          </label>
        </div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" (click)="cancelled.emit()" class="btn-secondary">Cancelar</button>
        <button type="submit" [disabled]="isSaving()" class="btn-primary">
          {{ isEditing() ? 'Guardar cambios' : 'Crear localización' }}
        </button>
      </div>
    </form>
  `
})
export class LocationForm {
  location = input<Location | null>(null);
  isSaving = input(false);
  submitted = output<LocationPayload>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly statuses = LOCATION_STATUS_OPTIONS;
  readonly isEditing = computed(() => this.location() !== null);

  readonly form = this.fb.nonNullable.group({
    city: ['', [Validators.required, notBlank, Validators.maxLength(100)]],
    region: ['', Validators.maxLength(100)],
    country: ['', [Validators.required, notBlank, Validators.maxLength(100)]],
    address: ['', Validators.maxLength(255)],
    postalCode: ['', Validators.maxLength(20)],
    latitude: new FormControl<number | null>(null, [Validators.min(-90), Validators.max(90)]),
    longitude: new FormControl<number | null>(null, [Validators.min(-180), Validators.max(180)]),
    status: ['active' as LocationStatus],
    isActive: [true]
  });

  constructor() {
    effect(() => {
      const location = this.location();
      if (location) {
        this.form.reset({
          city: location.city,
          region: location.region ?? '',
          country: location.country,
          address: location.address ?? '',
          postalCode: location.postalCode ?? '',
          latitude: location.latitude,
          longitude: location.longitude,
          status: location.status,
          isActive: location.isActive
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
    const payload: LocationPayload = {
      city: raw.city.trim(),
      region: raw.region.trim() || null,
      country: raw.country.trim(),
      address: raw.address.trim() || null,
      postalCode: raw.postalCode.trim() || null,
      latitude: raw.latitude,
      longitude: raw.longitude
    };

    if (this.isEditing()) {
      payload.status = raw.status;
      payload.isActive = raw.isActive;
    }

    this.submitted.emit(payload);
  }
}
