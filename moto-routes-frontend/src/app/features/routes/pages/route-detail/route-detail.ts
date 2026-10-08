import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  DIFFICULTY_LABELS,
  MotoRoute,
  STATUS_LABELS
} from '../../../../core/models/route.model';
import { RoutesService } from '../../../../core/services/routes.service';
import { ErrorState } from '../../../../shared/components/error-state/error-state';

@Component({
  selector: 'app-route-detail',
  imports: [RouterLink, ErrorState],
  template: `
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-center gap-3">
        <a routerLink="/routes" aria-label="Back to routes"
           class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 class="text-2xl font-semibold text-gray-900">Route details</h1>
      </div>

      @if (loading()) {
        <div class="animate-pulse space-y-4">
          <div class="h-8 w-2/3 rounded-lg bg-gray-200"></div>
          <div class="h-24 rounded-lg bg-gray-200"></div>
        </div>
      } @else if (route(); as r) {
        <div class="rounded-2xl border bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-xl font-semibold text-slate-900">{{ r.title }}</h2>
              <p class="text-xs text-slate-400">{{ r.slug }}</p>
            </div>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium"
                  [class.bg-teal-100]="r.isActive" [class.text-teal-800]="r.isActive"
                  [class.bg-slate-100]="!r.isActive" [class.text-slate-700]="!r.isActive">
              {{ r.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <p class="mb-5 text-sm text-slate-600">{{ r.description || 'Sin descripción.' }}</p>

          <dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div><dt class="text-xs text-slate-500">Region</dt><dd class="font-medium text-slate-800">{{ r.region }}</dd></div>
            <div><dt class="text-xs text-slate-500">Distance</dt><dd class="font-medium text-slate-800">{{ r.distanceKm }} km</dd></div>
            <div><dt class="text-xs text-slate-500">Difficulty</dt><dd class="font-medium text-slate-800">{{ difficultyLabels[r.difficulty] }}</dd></div>
            <div><dt class="text-xs text-slate-500">Status</dt><dd class="font-medium text-slate-800">{{ statusLabels[r.status] }}</dd></div>
          </dl>

          <div class="mt-6 flex justify-end gap-2">
            <a routerLink="/routes" class="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Back</a>
            <a [routerLink]="['/routes', r.slug, 'edit']" class="rounded-xl bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800">Edit</a>
          </div>
        </div>
      } @else {
        <app-error-state message="No se pudo cargar la ruta. Puede que se haya eliminado." (retry)="loadRoute()" />
      }
    </div>
  `
})
export class RouteDetail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly routesService = inject(RoutesService);

  readonly difficultyLabels = DIFFICULTY_LABELS;
  readonly statusLabels = STATUS_LABELS;

  readonly route = signal<MotoRoute | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    void this.loadRoute();
  }

  async loadRoute(): Promise<void> {
    const slug = this.activatedRoute.snapshot.paramMap.get('slug') ?? '';

    try {
      this.loading.set(true);
      const response = await this.routesService.getBySlug(slug);
      this.route.set(response.data);
    } catch {
      this.route.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
