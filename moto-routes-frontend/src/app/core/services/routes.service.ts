import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { MotoRoute, RoutePayload, RouteStatus, RouteView } from '../models/route.model';

@Injectable({ providedIn: 'root' })
export class RoutesService {
  private readonly api = inject(ApiService);

  /** Todas, menos las borradas. */
  getAll(): Promise<ApiResponse<MotoRoute[]>> {
    return this.api.get<ApiResponse<MotoRoute[]>>('routes');
  }

  getActive(): Promise<ApiResponse<MotoRoute[]>> {
    return this.api.get<ApiResponse<MotoRoute[]>>('routes/active');
  }

  getInactive(): Promise<ApiResponse<MotoRoute[]>> {
    return this.api.get<ApiResponse<MotoRoute[]>>('routes/inactive');
  }

  /** Solo las borradas (soft delete): la "papelera". */
  getDeleted(): Promise<ApiResponse<MotoRoute[]>> {
    return this.api.get<ApiResponse<MotoRoute[]>>('routes/deleted');
  }

  getByView(view: RouteView): Promise<ApiResponse<MotoRoute[]>> {
    switch (view) {
      case 'active':
        return this.getActive();
      case 'inactive':
        return this.getInactive();
      case 'deleted':
        return this.getDeleted();
      default:
        return this.getAll();
    }
  }

  getBySlug(slug: string): Promise<ApiResponse<MotoRoute>> {
    return this.api.get<ApiResponse<MotoRoute>>(`routes/slug/${encodeURIComponent(slug)}`);
  }

  create(data: RoutePayload): Promise<ApiResponse<MotoRoute>> {
    return this.api.post<ApiResponse<MotoRoute>>('routes', data);
  }

  update(id: string, data: Partial<RoutePayload>): Promise<ApiResponse<MotoRoute>> {
    return this.api.patch<ApiResponse<MotoRoute>>(`routes/${id}`, data);
  }

  activate(id: string): Promise<ApiResponse<MotoRoute>> {
    return this.api.patch<ApiResponse<MotoRoute>>(`routes/${id}/activate`, {});
  }

  deactivate(id: string): Promise<ApiResponse<MotoRoute>> {
    return this.api.patch<ApiResponse<MotoRoute>>(`routes/${id}/deactivate`, {});
  }

  setStatus(id: string, status: RouteStatus): Promise<ApiResponse<MotoRoute>> {
    return this.api.patch<ApiResponse<MotoRoute>>(`routes/${id}/status`, { status });
  }

  /** Soft delete. */
  remove(id: string): Promise<ApiResponse<unknown>> {
    return this.api.delete<ApiResponse<unknown>>(`routes/${id}`);
  }

  restore(id: string): Promise<ApiResponse<MotoRoute>> {
    return this.api.patch<ApiResponse<MotoRoute>>(`routes/${id}/restore`, {});
  }
}
