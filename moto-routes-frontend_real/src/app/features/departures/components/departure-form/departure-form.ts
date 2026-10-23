import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  DEPARTURE_STATUS_OPTIONS,
  Departure,
  DeparturePayload,
  DepartureStatus
} from '../../../../core/models/departure.model';
import { MotoRoute } from '../../../../core/models/route.model';

/** Convierte una fecha ISO a formato de input datetime-local (hora local). */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Formulario reactivo de salidas. El select de ruta se llena con las rutas recibidas. */
@Component({
  selector: 'app-departure-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-5">
      <div>
        <label for="routeId" class="mb-1 block text-sm font-medium text-slate-700">Ruta</label>
        <select id="routeId" formControlName="routeId" class="input">
          <option value="" disabled>Selecciona una ruta</option>
          @for (route of routes(); track route._id) {
            <option [value]="route._id">{{ route.title }}</option>
          }
        </select>
        @if (showError('routeId')) {
          <p class="error">{{ errorMessage('routeId') }}</p>
        }
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="startDatetime" class="mb-1 block text-sm font-medium text-slate-700">Inicio</label>
          <input id="startDatetime" formControlName="startDatetime" type="datetime-local" class="input" />
          @if (showError('startDatetime')) {
            <p class="error">{{ errorMessage('startDatetime') }}</p>
          }
        </div>

        <div>
          <label for="endDatetime" class="mb-1 block text-sm font-medium text-slate-700">Fin</label>
          <input id="endDatetime" formControlName="endDatetime" type="datetime-local" class="input" />
          @if (showError('endDatetime')) {
            <p class="error">{{ errorMessage('endDatetime') }}</p>
          }
        </div>
      </div>

      @if (dateError()) {
        <p class="error">{{ dateError() }}</p>
      }

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label for="capacity" class="mb-1 block text-sm font-medium text-slate-700">Plazas totales</label>
          <input id="capacity" formControlName="capacity" type="number" min="1" step="1" class="input" />
          @if (showError('capacity')) {
            <p class="error">{{ errorMessage('capacity') }}</p>
          }
        </div>

        <div>
          <label for="price" class="mb-1 block text-sm font-medium text-slate-700">Precio (€)</label>
          <input id="price" formControlName="price" type="number" min="0" step="0.01" class="input" />
          @if (showError('price')) {
            <p class="error">{{ errorMessage('price') }}</p>
          }
        </div>

        @if (isEditing()) {
          <div>
            <label for="bookedParticipants" class="mb-1 block text-sm font-medium text-slate-700">Plazas reservadas</label>
            <input id="bookedParticipants" formControlName="bookedParticipants" type="number" min="0" step="1" class="input" />
            @if (showError('bookedParticipants')) {
              <p class="error">{{ errorMessage('bookedParticipants') }}</p>
            }
          </div>
        }
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
            Salida activa
          </label>
        </div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" (click)="cancelled.emit()" class="btn-secondary">Cancelar</button>
        <button type="submit" [disabled]="isSaving()" class="btn-primary">
          {{ isEditing() ? 'Guardar cambios' : 'Crear salida' }}
        </button>
      </div>
    </form>
  `
})
export class DepartureForm {
  departure = input<Departure | null>(null);
  routes = input<MotoRoute[]>([]);
  isSaving = input(false);
  submitted = output<DeparturePayload>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly statuses = DEPARTURE_STATUS_OPTIONS;
  readonly isEditing = computed(() => this.departure() !== null);
  readonly dateError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    routeId: ['', Validators.required],
    startDatetime: ['', Validators.required],
    endDatetime: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    bookedParticipants: [0, Validators.min(0)],
    status: ['scheduled' as DepartureStatus],
    isActive: [true]
  });

  constructor() {
    effect(() => {
      const departure = this.departure();
      if (departure) {
        this.form.reset({
          routeId: departure.routeId,
          startDatetime: toLocalInput(departure.startDatetime),
          endDatetime: toLocalInput(departure.endDatetime),
          capacity: departure.capacity,
          price: departure.price,
          bookedParticipants: departure.bookedParticipants,
          status: departure.status,
          isActive: departure.isActive
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
    const start = new Date(raw.startDatetime);
    const end = new Date(raw.endDatetime);

    if (end <= start) {
      this.dateError.set('La fecha de fin debe ser posterior a la de inicio.');
      return;
    }
    this.dateError.set(null);

    const payload: DeparturePayload = {
      routeId: raw.routeId,
      startDatetime: start.toISOString(),
      endDatetime: end.toISOString(),
      capacity: Number(raw.capacity),
      price: Number(raw.price)
    };

    if (this.isEditing()) {
      payload.bookedParticipants = Number(raw.bookedParticipants);
      payload.status = raw.status;
      payload.isActive = raw.isActive;
    }

    this.submitted.emit(payload);
  }
}
