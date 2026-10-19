import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { MotoRoute, RoutePayload } from '../models/route.model';

@Injectable({ providedIn: 'root' })
export class RoutesService {
  private readonly api = inject(ApiService);

  getAll(): Promise<ApiResponse<MotoRoute[]>> {
    return this.api.get<ApiResponse<MotoRoute[]>>('routes');
  }

  getById(id: string): Promise<ApiResponse<MotoRoute>> {
    return this.api.get<ApiResponse<MotoRoute>>(`routes/${id}`);
  }

  create(payload: RoutePayload): Promise<ApiResponse<MotoRoute>> {
    return this.api.post<ApiResponse<MotoRoute>>('routes', payload);
  }

  update(id: string, payload: Partial<RoutePayload>): Promise<ApiResponse<MotoRoute>> {
    return this.api.patch<ApiResponse<MotoRoute>>(`routes/${id}`, payload);
  }

  setActive(id: string, isActive: boolean): Promise<ApiResponse<MotoRoute>> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.api.patch<ApiResponse<MotoRoute>>(`routes/${id}/${action}`, {});
  }

  remove(id: string): Promise<ApiResponse<MotoRoute>> {
    return this.api.delete<ApiResponse<MotoRoute>>(`routes/${id}`);
  }
}
