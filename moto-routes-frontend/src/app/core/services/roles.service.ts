import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Role, RolePayload } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly api = inject(ApiService);

  getActive(): Promise<ApiResponse<Role[]>> {
    return this.api.get<ApiResponse<Role[]>>('roles/active');
  }

  getAll(): Promise<ApiResponse<Role[]>> {
    return this.api.get<ApiResponse<Role[]>>('roles');
  }

  getById(id: string): Promise<ApiResponse<Role>> {
    return this.api.get<ApiResponse<Role>>(`roles/${id}`);
  }

  create(payload: RolePayload): Promise<ApiResponse<Role>> {
    return this.api.post<ApiResponse<Role>>('roles', payload);
  }

  update(id: string, payload: Partial<RolePayload>): Promise<ApiResponse<Role>> {
    return this.api.patch<ApiResponse<Role>>(`roles/${id}`, payload);
  }

  setActive(id: string, isActive: boolean): Promise<ApiResponse<Role>> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.api.patch<ApiResponse<Role>>(`roles/${id}/${action}`, {});
  }

  remove(id: string): Promise<ApiResponse<Role>> {
    return this.api.delete<ApiResponse<Role>>(`roles/${id}`);
  }

  restore(id: string): Promise<ApiResponse<Role>> {
    return this.api.patch<ApiResponse<Role>>(`roles/${id}/restore`, {});
  }
}
