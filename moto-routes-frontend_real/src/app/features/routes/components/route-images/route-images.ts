import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouteImage } from '../../../../core/models/route-image.model';
import { AlertService } from '../../../../core/services/alert.service';
import { RouteImagesService } from '../../../../core/services/route-images.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

/** Gestiona varias imágenes de una ruta: listar, añadir, marcar como principal y borrar. */
@Component({
  selector: 'app-route-images',
  imports: [ReactiveFormsModule, EmptyState, ErrorState, SkeletonLoader],
  template: `
    <section>
      <h2 class="mb-4 text-lg font-semibold text-slate-800">Imágenes de la ruta</h2>

      @if (loading()) {
        <app-skeleton-loader [rows]="2" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (!hasImages()) {
        <app-empty-state heading="Sin imágenes" message="Añade la primera imagen de la ruta." />
      } @else {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (image of images(); track image._id) {
            <article class="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <img [src]="image.imageUrl" [alt]="image.altText ?? ''" class="h-40 w-full object-cover" />
              <div class="space-y-2 p-3">
                <div class="flex items-center justify-between text-xs">
                  @if (image.isCover) {
                    <span class="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Principal</span>
                  } @else {
                    <span class="text-slate-400">Posición {{ image.position }}</span>
                  }
                  <span class="truncate text-slate-500">{{ image.altText }}</span>
                </div>
                <div class="flex gap-2">
                  @if (!image.isCover) {
                    <button type="button" (click)="makeCover(image)" [disabled]="busyId() === image._id" class="btn-secondary text-xs">
                      Marcar principal
                    </button>
                  }
                  <button type="button" (click)="remove(image)" [disabled]="busyId() === image._id" class="btn-danger text-xs">
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="add()" novalidate class="mt-6 space-y-3 rounded-xl border border-dashed border-slate-300 p-4">
        <h3 class="text-sm font-semibold text-slate-700">Añadir imagen</h3>

        <div>
          <label for="imageUrl" class="mb-1 block text-sm font-medium text-slate-700">URL de la imagen</label>
          <input id="imageUrl" formControlName="imageUrl" type="url" placeholder="https://..." class="input" />
          @if (form.controls.imageUrl.invalid && form.controls.imageUrl.touched) {
            <p class="error">Introduce una URL que empiece por http:// o https://</p>
          }
        </div>

        <div>
          <label for="altText" class="mb-1 block text-sm font-medium text-slate-700">Texto alternativo</label>
          <input id="altText" formControlName="altText" type="text" class="input" />
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" formControlName="isCover" class="accent-teal-700" />
          Usar como imagen principal
        </label>

        <div class="flex justify-end">
          <button type="submit" [disabled]="adding()" class="btn-primary">Añadir imagen</button>
        </div>
      </form>
    </section>
  `
})
export class RouteImages implements OnInit {
  routeId = input.required<string>();

  private readonly imagesService = inject(RouteImagesService);
  private readonly alert = inject(AlertService);
  private readonly fb = inject(FormBuilder);

  readonly images = signal<RouteImage[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly adding = signal(false);
  readonly busyId = signal<string | null>(null);
  readonly hasImages = computed(() => this.images().length > 0);

  readonly form = this.fb.nonNullable.group({
    imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    altText: [''],
    isCover: [false]
  });

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.imagesService.getByRoute(this.routeId());
      this.images.set(response.data);
    } catch {
      this.error.set('No se pudieron cargar las imágenes.');
    } finally {
      this.loading.set(false);
    }
  }

  async add(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.adding.set(true);
    try {
      await this.imagesService.create(this.routeId(), {
        imageUrl: raw.imageUrl.trim(),
        altText: raw.altText.trim() || null,
        position: this.images().length,
        isCover: raw.isCover
      });
      this.form.reset({ imageUrl: '', altText: '', isCover: false });
      await this.load();
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.adding.set(false);
    }
  }

  async makeCover(image: RouteImage): Promise<void> {
    this.busyId.set(image._id);
    try {
      await this.imagesService.update(this.routeId(), image._id, { isCover: true });
      await this.load();
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(image: RouteImage): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar imagen?', 'La imagen dejará de mostrarse en la ruta.', 'Eliminar');
    if (!result.isConfirmed) return;

    this.busyId.set(image._id);
    try {
      await this.imagesService.remove(this.routeId(), image._id);
      await this.load();
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.busyId.set(null);
    }
  }
}
