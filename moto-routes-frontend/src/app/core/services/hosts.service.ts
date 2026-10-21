import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Host, HostPayload, HostStatus } from '../models/host.model';

@Injectable({ providedIn: 'root' })
export class HostsService {
  private readonly api = inject(ApiService);

  getAll(): Promise<ApiResponse<Host[]>> {
    return this.api.get<ApiResponse<Host[]>>('hosts');
  }

  getById(id: string): Promise<ApiResponse<Host>> {
    return this.api.get<ApiResponse<Host>>(`hosts/${id}`);
  }

  create(payload: HostPayload): Promise<ApiResponse<Host>> {
    return this.api.post<ApiResponse<Host>>('hosts', payload);
  }

  update(id: string, payload: Partial<HostPayload>): Promise<ApiResponse<Host>> {
    return this.api.patch<ApiResponse<Host>>(`hosts/${id}`, payload);
  }

  setActive(id: string, isActive: boolean): Promise<ApiResponse<Host>> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.api.patch<ApiResponse<Host>>(`hosts/${id}/${action}`, {});
  }

  setStatus(id: string, status: HostStatus): Promise<ApiResponse<Host>> {
    return this.api.patch<ApiResponse<Host>>(`hosts/${id}/status`, { status });
  }

  remove(id: string): Promise<ApiResponse<Host>> {
    return this.api.delete<ApiResponse<Host>>(`hosts/${id}`);
  }

  restore(id: string): Promise<ApiResponse<Host>> {
    return this.api.patch<ApiResponse<Host>>(`hosts/${id}/restore`, {});
  }
}
