import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Host, HostPayload } from '../../../../core/models/host.model';
import { AlertService } from '../../../../core/services/alert.service';
import { HostsService } from '../../../../core/services/hosts.service';
import { HostsStore } from '../../../../core/stores/hosts.store';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { ImagesManager } from '../../../../shared/components/images-manager/images-manager';
import { HostForm } from '../../components/host-form/host-form';

@Component({
  selector: 'app-host-edit',
  imports: [HostForm, RouterLink, SkeletonLoader, ErrorState, ImagesManager],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 flex items-center gap-3">
        <a routerLink="/hosts" class="btn-secondary text-xs">← Volver</a>
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-slate-900">Editar guía</h1>
          <p class="truncate text-sm text-slate-500">{{ host()?.name }}</p>
        </div>
      </header>

      @if (loading()) {
        <app-skeleton-loader [rows]="4" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (host(); as current) {
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-host-form [host]="current" [isSaving]="saving()" (submitted)="save($event)" (cancelled)="back()" />
        </div>

        <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <app-images-manager [basePath]="'hosts/' + current._id + '/images'" />
        </div>
      }
    </section>
  `
})
export class HostEdit implements OnInit {
  /** Llega desde la URL (/hosts/:id/edit). */
  id = input.required<string>();

  private readonly hostsService = inject(HostsService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly store = inject(HostsStore);

  readonly host = signal<Host | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.hostsService.getById(this.id());
      this.host.set(response.data);
    } catch {
      this.error.set('No se pudo cargar el guía. Puede que se haya eliminado.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(payload: HostPayload): Promise<void> {
    this.saving.set(true);
    try {
      const response = await this.hostsService.update(this.id(), payload);
      this.store.upsert(response.data);
      await this.alert.toast('Guía actualizado', response.data.name);
      await this.router.navigate(['/hosts']);
    } catch {
      // El interceptor de errores ya muestra el motivo.
    } finally {
      this.saving.set(false);
    }
  }

  back(): void {
    void this.router.navigate(['/hosts']);
  }
}
