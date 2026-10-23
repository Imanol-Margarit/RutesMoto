import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Category, CategoryPayload } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly api = inject(ApiService);

  getAll(): Promise<ApiResponse<Category[]>> {
    return this.api.get<ApiResponse<Category[]>>('categories');
  }

  getById(id: string): Promise<ApiResponse<Category>> {
    return this.api.get<ApiResponse<Category>>(`categories/${id}`);
  }

  create(payload: CategoryPayload): Promise<ApiResponse<Category>> {
    return this.api.post<ApiResponse<Category>>('categories', payload);
  }

  update(id: string, payload: Partial<CategoryPayload>): Promise<ApiResponse<Category>> {
    return this.api.patch<ApiResponse<Category>>(`categories/${id}`, payload);
  }

  setActive(id: string, isActive: boolean): Promise<ApiResponse<Category>> {
    const action = isActive ? 'activate' : 'deactivate';
    return this.api.patch<ApiResponse<Category>>(`categories/${id}/${action}`, {});
  }

  remove(id: string): Promise<ApiResponse<Category>> {
    return this.api.delete<ApiResponse<Category>>(`categories/${id}`);
  }

  restore(id: string): Promise<ApiResponse<Category>> {
    return this.api.patch<ApiResponse<Category>>(`categories/${id}/restore`, {});
  }
}
