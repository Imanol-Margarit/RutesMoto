import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShopService } from '../../../../core/services/shop.service';
import { ShopDeparture, ShopRouteDetail } from '../../../../core/models/shop.model';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { ErrorState } from '../../../../shared/components/error-state/error-state';

const DIFFICULTY_LABEL: Record<string, string> = { facil: 'Fácil', media: 'Media', dificil: 'Difícil' };
const SURFACE_LABEL: Record<string, string> = { asfalto: 'Asfalto', mixto: 'Mixto', tierra: 'Tierra' };

@Component({
  selector: 'app-shop-detail',
  imports: [RouterLink, DatePipe, DecimalPipe, SkeletonLoader, ErrorState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <a routerLink="/shop/rutas" class="text-sm font-semibold text-teal-700 hover:text-teal-800">← Volver al catálogo</a>

      @if (loading()) {
        <div class="mt-6"><app-skeleton-loader /></div>
      } @else if (error()) {
        <div class="mt-6"><app-error-state [message]="error()!" (retry)="load()" /></div>
      } @else if (route(); as r) {
        <div class="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <!-- Galería -->
          <div class="space-y-3">
            <div class="card-flush aspect-[16/10] bg-mint">
              @if (r.images.length) {
                <img [src]="r.images[0].url" [alt]="r.images[0].alt ?? r.title" class="h-full w-full object-cover" />
              } @else {
                <div class="grid h-full place-items-center text-sm text-teal-800/70">Sin imágenes</div>
              }
            </div>
            @if (r.images.length > 1) {
              <div class="grid grid-cols-4 gap-3">
                @for (image of r.images.slice(1, 5); track $index) {
                  <img [src]="image.url" [alt]="image.alt ?? r.title" class="aspect-square w-full rounded-xl object-cover" />
                }
              </div>
            }
          </div>

          <!-- Resumen -->
          <aside class="space-y-6">
            <div>
              @if (r.category) {
                <p class="page-eyebrow">{{ r.category.name }}</p>
              }
              <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ r.title }}</h1>
              @if (r.location) {
                <p class="mt-2 text-sm text-slate-500">{{ r.location.city }}, {{ r.location.country }}</p>
              }
            </div>

            <dl class="card grid grid-cols-2 gap-4">
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-slate-400">Distancia</dt>
                <dd class="font-semibold text-slate-900">{{ r.distanceKm | number: '1.0-1' }} km</dd>
              </div>
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-slate-400">Dificultad</dt>
                <dd class="font-semibold text-slate-900">{{ difficultyLabel(r.difficulty) }}</dd>
              </div>
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-slate-400">Firme</dt>
                <dd class="font-semibold text-slate-900">{{ surfaceLabel(r.surface) }}</dd>
              </div>
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-slate-400">Duración</dt>
                <dd class="font-semibold text-slate-900">
                  {{ r.estimatedMinutes ? (r.estimatedMinutes | number) + ' min' : '—' }}
                </dd>
              </div>
              @if (r.startPoint) {
                <div class="col-span-2">
                  <dt class="text-[11px] uppercase tracking-wide text-slate-400">Punto de salida</dt>
                  <dd class="font-semibold text-slate-900">{{ r.startPoint }}</dd>
                </div>
              }
              @if (r.host) {
                <div class="col-span-2">
                  <dt class="text-[11px] uppercase tracking-wide text-slate-400">Guía</dt>
                  <dd class="font-semibold text-slate-900">{{ r.host.name }}</dd>
                </div>
              }
            </dl>

            @if (r.description) {
              <p class="whitespace-pre-line text-slate-700">{{ r.description }}</p>
            }
          </aside>
        </div>

        <!-- Salidas disponibles -->
        <section class="mt-14">
          <p class="page-eyebrow">Próximas salidas</p>
          <h2 class="mb-6 text-2xl font-semibold tracking-tight text-slate-900">Reserva tu plaza</h2>

          @if (departures().length === 0) {
            <div class="card-flush px-6 py-12 text-center text-sm text-slate-500">
              No hay salidas programadas con plazas libres. Vuelve a consultar más adelante.
            </div>
          } @else {
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              @for (departure of departures(); track departure._id) {
                <article class="card flex flex-col gap-3">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ departure.startDatetime | date: 'EEEE d MMM, HH:mm' }}
                  </p>
                  <p class="text-sm text-slate-500">
                    Hasta {{ departure.endDatetime | date: 'HH:mm' }}
                  </p>
                  <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <span class="text-lg font-bold text-slate-900">{{ departure.price | number: '1.2-2' }} €</span>
                    <span class="rounded-full bg-leaf px-2.5 py-1 text-xs font-semibold text-slate-800">
                      {{ departure.seatsLeft }} {{ departure.seatsLeft === 1 ? 'plaza libre' : 'plazas libres' }}
                    </span>
                  </div>
                </article>
              }
            </div>
          }
        </section>
      }
    </section>
  `
})
export class ShopDetail implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly shopService = inject(ShopService);

  readonly route = signal<ShopRouteDetail | null>(null);
  readonly departures = signal<ShopDeparture[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private slug = '';
  private subscription?: { unsubscribe(): void };

  ngOnInit(): void {
    this.subscription = this.activatedRoute.paramMap.subscribe((params) => {
      this.slug = params.get('slug') ?? '';
      void this.load();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.shopService.getRouteDetail(this.slug);
      this.route.set(response.data);
      const departures = await this.shopService.getRouteDepartures(this.slug);
      this.departures.set(departures.data);
    } catch {
      this.route.set(null);
      this.error.set('No se pudo cargar la ruta. Puede que ya no esté publicada.');
    } finally {
      this.loading.set(false);
    }
  }

  difficultyLabel(value: string): string {
    return DIFFICULTY_LABEL[value] ?? value;
  }

  surfaceLabel(value: string): string {
    return SURFACE_LABEL[value] ?? value;
  }
}
