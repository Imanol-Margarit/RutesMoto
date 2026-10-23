import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Departure, DeparturePayload, DepartureStatus } from '../models/departure.model';

@Injectable({ providedIn: 'root' })
export class DeparturesService {
  private readonly api = inject(ApiService);

  getAll(): Promise<ApiResponse<Departure[]>> {
    return this.api.get<ApiResponse<Departure[]>>('departures');
  }

  getById(id: string): Promise<ApiResponse<Departure>> {
    return this.api.get<ApiResponse<Departure>>(`departures/${id}`);
  }

  create(payload: DeparturePayload): Promise<ApiResponse<Departure>> {
    return this.api.post<ApiResponse<Departure>>('departures', payload);
  }

  update(id: string, payload: Partial<DeparturePayload>): Promise<ApiResponse<Departure>> {
    return this.api.patch<ApiResponse<Departure>>(`departures/${id}`, payload);
  }

  setActive(id: string, isActive: boolean): Promise<ApiResponse<Departure>> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.api.patch<ApiResponse<Departure>>(`departures/${id}/${action}`, {});
  }

  setStatus(id: string, status: DepartureStatus): Promise<ApiResponse<Departure>> {
    return this.api.patch<ApiResponse<Departure>>(`departures/${id}/status`, { status });
  }

  remove(id: string): Promise<ApiResponse<Departure>> {
    return this.api.delete<ApiResponse<Departure>>(`departures/${id}`);
  }

  getActive(): Promise<ApiResponse<Departure[]>> {
    return this.api.get<ApiResponse<Departure[]>>('departures/active');
  }

  getInactive(): Promise<ApiResponse<Departure[]>> {
    return this.api.get<ApiResponse<Departure[]>>('departures/inactive');
  }

  getDeleted(): Promise<ApiResponse<Departure[]>> {
    return this.api.get<ApiResponse<Departure[]>>('departures/deleted');
  }

  getBySlug(slug: string): Promise<ApiResponse<Departure>> {
    return this.api.get<ApiResponse<Departure>>(`departures/slug/${encodeURIComponent(slug)}`);
  }

  restore(id: string): Promise<ApiResponse<Departure>> {
    return this.api.patch<ApiResponse<Departure>>(`departures/${id}/restore`, {});
  }
}
