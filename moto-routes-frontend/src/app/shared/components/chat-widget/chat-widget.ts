import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgentService, ChatMessage } from '../../../core/services/agent.service';

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de Motoruta. Puedo recomendarte rutas, compararlas, decirte el tiempo previsto o resolver dudas.'
};

/** Chat flotante con el agente de IA. Público: no necesita sesión. */
@Component({
  selector: 'app-chat-widget',
  imports: [RouterLink],
  template: `
    @if (open()) {
      <section class="fixed bottom-24 right-4 z-40 flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-sage bg-white shadow-2xl">
        <header class="flex items-center justify-between bg-teal-800 px-4 py-3 text-white">
          <div>
            <p class="text-sm font-semibold">Asistente Motoruta</p>
            <p class="text-[11px] text-teal-100">Rutas, salidas, clima y dudas</p>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" (click)="reset()" class="rounded-lg px-2 py-1 text-xs hover:bg-teal-700" title="Nueva conversación">Nueva</button>
            <button type="button" (click)="open.set(false)" class="rounded-lg px-2 py-1 text-lg leading-none hover:bg-teal-700" aria-label="Cerrar chat">×</button>
          </div>
        </header>

        <div #scroller class="flex-1 space-y-3 overflow-y-auto bg-frost p-3">
          @for (message of messages(); track $index) {
            <div [class]="message.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
              <div [class]="message.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-teal-700 px-3 py-2 text-sm text-white'
                    : 'max-w-[85%] rounded-2xl rounded-bl-sm border border-sage/70 bg-white px-3 py-2 text-sm text-slate-800'">
                <p class="whitespace-pre-line">{{ message.content }}</p>

                @if (message.routes?.length) {
                  <div class="mt-2 space-y-2">
                    @for (route of message.routes; track route.slug) {
                      <a [routerLink]="['/shop/rutas', route.slug]" (click)="open.set(false)"
                         class="flex items-center gap-2 rounded-xl border border-sage/70 bg-frost p-2 hover:bg-seafoam">
                        @if (route.image) {
                          <img [src]="route.image.url" [alt]="route.image.alt" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
                        }
                        <div class="min-w-0">
                          <p class="truncate text-xs font-semibold text-slate-900">{{ route.title }}</p>
                          <p class="text-[11px] text-slate-500">
                            {{ route.location?.city ?? '' }} · {{ route.distanceKm }} km
                            @if (route.minPrice !== null) { · desde {{ route.minPrice }} € }
                          </p>
                        </div>
                      </a>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (sending()) {
            <div class="flex justify-start">
              <div class="rounded-2xl rounded-bl-sm border border-sage/70 bg-white px-3 py-2 text-sm text-slate-500">Escribiendo…</div>
            </div>
          }

          @if (error()) {
            <p class="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{{ error() }}</p>
          }
        </div>

        <form (submit)="send($event)" class="flex items-end gap-2 border-t border-sage/70 p-3">
          <textarea #box rows="1" maxlength="2000" placeholder="Escribe tu pregunta…"
                    class="input max-h-28 flex-1 resize-none !py-2 !text-sm"
                    [value]="draft()" (input)="draft.set(box.value)" (keydown.enter)="onEnter($event)"></textarea>
          <button type="submit" class="btn-primary !px-3 !py-2 text-sm" [disabled]="sending() || !draft().trim()">Enviar</button>
        </form>
      </section>
    }

    <button type="button" (click)="toggle()"
            class="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-2xl text-white shadow-lg hover:bg-teal-800"
            [attr.aria-label]="open() ? 'Cerrar asistente' : 'Abrir asistente'">
      {{ open() ? '×' : '💬' }}
    </button>
  `
})
export class ChatWidget {
  private readonly agent = inject(AgentService);
  private readonly scroller = viewChild<ElementRef<HTMLDivElement>>('scroller');

  readonly open = signal(false);
  readonly sending = signal(false);
  readonly error = signal('');
  readonly draft = signal('');
  readonly messages = signal<ChatMessage[]>([WELCOME]);

  toggle(): void {
    this.open.update((value) => !value);
    this.scrollToBottom();
  }

  reset(): void {
    this.messages.set([WELCOME]);
    this.error.set('');
    this.draft.set('');
  }

  /** Enter envía; Shift+Enter hace salto de línea. */
  onEnter(event: Event): void {
    if ((event as KeyboardEvent).shiftKey) return;
    event.preventDefault();
    this.send();
  }

  async send(event?: Event): Promise<void> {
    event?.preventDefault();
    const text = this.draft().trim();
    if (!text || this.sending()) return;

    this.error.set('');
    this.draft.set('');
    this.messages.update((list) => [...list, { role: 'user', content: text }]);
    this.sending.set(true);
    this.scrollToBottom();

    try {
      // El saludo inicial no se envía: es solo de la interfaz.
      const history = this.messages().filter((message) => message !== WELCOME);
      const { reply, routes } = await this.agent.chat(history);
      this.messages.update((list) => [...list, { role: 'assistant', content: reply, routes }]);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      this.sending.set(false);
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.scroller()?.nativeElement;
      if (element) element.scrollTop = element.scrollHeight;
    });
  }
}