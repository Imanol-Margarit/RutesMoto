import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { User, UserPayload } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);

  getAll(): Promise<ApiResponse<User[]>> {
    return this.api.get<ApiResponse<User[]>>('users');
  }

  getById(id: string): Promise<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`users/${id}`);
  }

  create(payload: UserPayload): Promise<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>('users', payload);
  }

  update(id: string, payload: Partial<UserPayload>): Promise<ApiResponse<User>> {
    return this.api.patch<ApiResponse<User>>(`users/${id}`, payload);
  }

  setActive(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.api.patch<ApiResponse<User>>(`users/${id}/${action}`, {});
  }

  remove(id: string): Promise<ApiResponse<User>> {
    return this.api.delete<ApiResponse<User>>(`users/${id}`);
  }
}
