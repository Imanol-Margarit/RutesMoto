import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly api = inject(ApiService);

  getActive(): Promise<ApiResponse<Role[]>> {
    return this.api.get<ApiResponse<Role[]>>('roles/active');
  }
}
