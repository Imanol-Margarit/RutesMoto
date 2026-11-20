import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  routes?: ChatRoute[];
}

export interface ChatRoute {
  title: string;
  slug: string;
  difficulty: string;
  distanceKm: number;
  minPrice: number | null;
  image: { url: string; alt: string } | null;
  location: { city: string; latitude: number | null; longitude: number | null } | null;
}

interface ChatResponse {
  success: boolean;
  message: string;
  data?: { reply: string; routes: ChatRoute[] };
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly url = `${environment.aiUrl}/agent/chat`;

  /** Envía el historial (solo role y content) y devuelve la respuesta del agente. */
  async chat(history: ChatMessage[]): Promise<{ reply: string; routes: ChatRoute[] }> {
    const messages = history.slice(-20).map(({ role, content }) => ({ role, content }));

    let response: Response;
    try {
      response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(60000)
      });
    } catch {
      throw new Error('No se pudo conectar con el asistente');
    }

    const body: ChatResponse = await response.json().catch(() => ({ success: false, message: '' }));
    if (!response.ok || !body.data) {
      throw new Error(body.message || 'El asistente no está disponible');
    }
    return body.data;
  }
}