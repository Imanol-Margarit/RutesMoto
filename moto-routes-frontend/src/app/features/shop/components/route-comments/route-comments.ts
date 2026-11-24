import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../../auth/auth.store';
import { CommentsService } from '../../../../core/services/comments.service';
import { AgentService } from '../../../../core/services/agent.service';
import { AlertService } from '../../../../core/services/alert.service';
import { CommentStats, RouteComment } from '../../../../core/models/comment.model';

const MAX_LENGTH = 1000;

/**
 * Comentarios de una ruta en el detalle de la tienda.
 * - Leer: cualquiera.
 * - Escribir: usuario logueado (uno por ruta). Editar: el autor. Borrar: el autor, admin o host.
 * - Resumen con IA: lo genera el microservicio moto-routes-ai.
 */
@Component({
  selector: 'app-route-comments',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe],
  template: `
    <section class="mt-14">
      <p class="page-eyebrow">Opiniones</p>
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Lo que dicen los moteros</h2>
          @if (stats().count > 0) {
            <p class="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <span class="text-amber-500" aria-hidden="true">{{ stars(stats().average ?? 0) }}</span>
              <span class="font-semibold text-slate-900">{{ stats().average | number: '1.1-1' }}</span>
              <span>· {{ stats().count }} {{ stats().count === 1 ? 'comentario' : 'comentarios' }}</span>
            </p>
          }
        </div>
        @if (stats().count > 0) {
          <button type="button" class="btn-secondary" (click)="summarize()" [disabled]="summarizing()">
            {{ summarizing() ? 'Resumiendo…' : '✨ Resumir con IA' }}
          </button>
        }
      </div>

      <!-- Resumen de la IA -->
      @if (summary() || summaryError()) {
        <div class="card mb-6 border-l-4 border-teal-600">
          <p class="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Resumen generado por IA</p>
          @if (summary()) {
            <p class="whitespace-pre-line text-sm text-slate-700">{{ summary() }}</p>
          } @else {
            <p class="text-sm text-red-600">{{ summaryError() }}</p>
          }
        </div>
      }

      <!-- Formulario (solo con sesión) -->
      @if (!auth.isAuthenticated()) {
        <div class="card-flush mb-6 px-6 py-5 text-sm text-slate-600">
          <a routerLink="/login" [queryParams]="{ returnUrl: router.url }" class="font-semibold text-teal-700 hover:underline">Inicia sesión</a>
          para dejar tu opinión sobre esta ruta.
        </div>
      } @else if (!myComment() || editingId()) {
        <form class="card mb-6 space-y-3" [formGroup]="form" (ngSubmit)="save()">
          <p class="text-sm font-semibold text-slate-900">{{ editingId() ? 'Editar tu comentario' : 'Deja tu opinión' }}</p>

          <div class="flex items-center gap-1" role="radiogroup" aria-label="Valoración">
            @for (value of [1, 2, 3, 4, 5]; track value) {
              <button type="button" class="text-2xl leading-none transition"
                      [class.text-amber-500]="value <= form.controls.rating.value"
                      [class.text-slate-300]="value > form.controls.rating.value"
                      [attr.aria-label]="value + ' estrellas'"
                      [attr.aria-checked]="value === form.controls.rating.value"
                      role="radio"
                      (click)="form.controls.rating.setValue(value)">★</button>
            }
          </div>

          <textarea formControlName="content" rows="3" class="input w-full" [attr.maxlength]="maxLength"
                    placeholder="¿Qué tal las curvas, el firme, el guía…?"></textarea>
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>{{ form.controls.content.value.length }}/{{ maxLength }}</span>
            <div class="flex gap-2">
              @if (editingId()) {
                <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
              }
              <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Guardando…' : editingId() ? 'Guardar cambios' : 'Publicar' }}
              </button>
            </div>
          </div>
        </form>
      }

      <!-- Listado -->
      @if (loading()) {
        <p class="text-sm text-slate-500">Cargando comentarios…</p>
      } @else if (comments().length === 0) {
        <div class="card-flush px-6 py-10 text-center text-sm text-slate-500">
          Todavía no hay comentarios. ¡Sé el primero en opinar!
        </div>
      } @else {
        <ul class="space-y-4">
          @for (comment of comments(); track comment._id) {
            <li class="card">
              <div class="flex items-start gap-3">
                @if (comment.author.avatarUrl) {
                  <img [src]="comment.author.avatarUrl" alt="" class="h-10 w-10 rounded-full object-cover" />
                } @else {
                  <div class="grid h-10 w-10 place-items-center rounded-full bg-mint text-sm font-semibold text-teal-800">
                    {{ initials(comment) }}
                  </div>
                }
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="text-sm font-semibold text-slate-900">
                      {{ comment.author.firstName }} {{ comment.author.lastName }}
                      @if (isMine(comment)) { <span class="ml-1 text-xs font-normal text-teal-700">(tú)</span> }
                    </p>
                    <p class="text-xs text-slate-400">{{ comment.createdAt | date: 'd MMM y' }}</p>
                  </div>
                  <p class="text-amber-500" [attr.aria-label]="comment.rating + ' de 5'">{{ stars(comment.rating) }}</p>
                  <p class="mt-1 whitespace-pre-line text-sm text-slate-700">{{ comment.content }}</p>

                  @if (isMine(comment) || auth.isAdmin()) {
                    <div class="mt-2 flex gap-3 text-xs font-semibold">
                      @if (isMine(comment)) {
                        <button type="button" class="text-teal-700 hover:underline" (click)="startEdit(comment)">Editar</button>
                      }
                      <button type="button" class="text-red-600 hover:underline" (click)="remove(comment)">Eliminar</button>
                    </div>
                  }
                </div>
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `
})
export class RouteComments {
  readonly auth = inject(AuthStore);
  readonly router = inject(Router);
  private readonly commentsService = inject(CommentsService);
  private readonly agentService = inject(AgentService);
  private readonly alert = inject(AlertService);

  /** Slug de la ruta del detalle. */
  readonly slug = input.required<string>();
  /** Avisa al detalle cuando cambia la media o el número de comentarios. */
  readonly statsChange = output<CommentStats>();

  readonly maxLength = MAX_LENGTH;
  readonly comments = signal<RouteComment[]>([]);
  readonly stats = signal<CommentStats>({ count: 0, average: null });
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly summary = signal<string | null>(null);
  readonly summaryError = signal<string | null>(null);
  readonly summarizing = signal(false);

  /** El comentario del usuario logueado en esta ruta (como mucho uno). */
  readonly myComment = computed(() => {
    const userId = this.auth.user()?._id;
    return userId ? this.comments().find((comment) => comment.userId === userId) ?? null : null;
  });

  readonly form = inject(FormBuilder).nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    content: ['', [Validators.required, Validators.maxLength(MAX_LENGTH), Validators.pattern(/\S/)]]
  });

  constructor() {
    // Recarga cuando cambia la ruta (navegar de un detalle a otro reutiliza el componente).
    effect(() => {
      const slug = this.slug();
      untracked(() => {
        this.summary.set(null);
        this.summaryError.set(null);
        this.cancelEdit();
        void this.load(slug);
      });
    });
  }

  async load(slug = this.slug()): Promise<void> {
    this.loading.set(true);
    try {
      const response = await this.commentsService.listByRoute(slug);
      this.comments.set(response.data.items);
      this.stats.set(response.data.stats);
      this.statsChange.emit(response.data.stats);
    } catch {
      this.comments.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    const { rating, content } = this.form.getRawValue();
    const input = { rating, content: content.trim() };
    const id = this.editingId();

    this.saving.set(true);
    try {
      if (id) {
        await this.commentsService.update(id, input);
      } else {
        await this.commentsService.create(this.slug(), input);
      }
      this.cancelEdit();
      this.summary.set(null);
      await this.load();
      void this.alert.toast(id ? 'Comentario actualizado' : 'Comentario publicado');
    } catch {
      // El errorInterceptor ya muestra el mensaje de la API (409, 400...).
    } finally {
      this.saving.set(false);
    }
  }

  startEdit(comment: RouteComment): void {
    this.editingId.set(comment._id);
    this.form.setValue({ rating: comment.rating, content: comment.content });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ rating: 5, content: '' });
  }

  async remove(comment: RouteComment): Promise<void> {
    const result = await this.alert.confirm('¿Eliminar el comentario?', 'No se mostrará más en la ruta.', 'Eliminar');
    if (!result.isConfirmed) return;
    try {
      await this.commentsService.remove(comment._id);
      if (this.editingId() === comment._id) this.cancelEdit();
      this.summary.set(null);
      await this.load();
    } catch {
      // Aviso mostrado por el errorInterceptor.
    }
  }

  async summarize(): Promise<void> {
    this.summarizing.set(true);
    this.summaryError.set(null);
    try {
      const result = await this.agentService.summarizeComments(this.slug());
      this.summary.set(result.summary ?? 'Todavía no hay comentarios que resumir.');
    } catch (error) {
      this.summary.set(null);
      this.summaryError.set(error instanceof Error ? error.message : 'No se pudo generar el resumen.');
    } finally {
      this.summarizing.set(false);
    }
  }

  isMine(comment: RouteComment): boolean {
    return comment.userId === this.auth.user()?._id;
  }

  initials(comment: RouteComment): string {
    return `${comment.author.firstName.charAt(0)}${comment.author.lastName.charAt(0)}`.toUpperCase();
  }

  /** 3.6 -> "★★★★☆" (redondeado). */
  stars(value: number): string {
    const full = Math.round(value);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
}
