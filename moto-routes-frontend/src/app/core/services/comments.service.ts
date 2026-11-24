import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { CommentInput, RouteComment, RouteComments } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly api = inject(ApiService);

  /** Público: comentarios y estadísticas de una ruta. */
  listByRoute(slug: string): Promise<ApiResponse<RouteComments>> {
    return this.api.get<ApiResponse<RouteComments>>(`comments/route/${encodeURIComponent(slug)}`);
  }

  /** Requiere sesión: el autor lo pone el backend a partir de la cookie. */
  create(slug: string, input: CommentInput): Promise<ApiResponse<RouteComment>> {
    return this.api.post<ApiResponse<RouteComment>>(`comments/route/${encodeURIComponent(slug)}`, input);
  }

  update(id: string, input: Partial<CommentInput>): Promise<ApiResponse<RouteComment>> {
    return this.api.patch<ApiResponse<RouteComment>>(`comments/${id}`, input);
  }

  remove(id: string): Promise<ApiResponse<RouteComment>> {
    return this.api.delete<ApiResponse<RouteComment>>(`comments/${id}`);
  }
}
