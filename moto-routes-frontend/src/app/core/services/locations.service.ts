import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Location, LocationPayload, LocationStatus } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private readonly api = inject(ApiService);

  getAll(): Promise<ApiResponse<Location[]>> {
    return this.api.get<ApiResponse<Location[]>>('locations');
  }

  getById(id: string): Promise<ApiResponse<Location>> {
    return this.api.get<ApiResponse<Location>>(`locations/${id}`);
  }

  create(payload: LocationPayload): Promise<ApiResponse<Location>> {
    return this.api.post<ApiResponse<Location>>('locations', payload);
  }

  update(id: string, payload: Partial<LocationPayload>): Promise<ApiResponse<Location>> {
    return this.api.patch<ApiResponse<Location>>(`locations/${id}`, payload);
  }

  setActive(id: string, isActive: boolean): Promise<ApiResponse<Location>> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.api.patch<ApiResponse<Location>>(`locations/${id}/${action}`, {});
  }

  setStatus(id: string, status: LocationStatus): Promise<ApiResponse<Location>> {
    return this.api.patch<ApiResponse<Location>>(`locations/${id}/status`, { status });
  }

  remove(id: string): Promise<ApiResponse<Location>> {
    return this.api.delete<ApiResponse<Location>>(`locations/${id}`);
  }

  restore(id: string): Promise<ApiResponse<Location>> {
    return this.api.patch<ApiResponse<Location>>(`locations/${id}/restore`, {});
  }
}
