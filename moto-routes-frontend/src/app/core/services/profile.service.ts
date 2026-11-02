import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { ProfilePayload, ProfileResponse } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  getMe(): Promise<ApiResponse<ProfileResponse>> {
    return this.api.get<ApiResponse<ProfileResponse>>('profile');
  }

  updateMe(payload: ProfilePayload): Promise<ApiResponse<ProfileResponse>> {
    return this.api.put<ApiResponse<ProfileResponse>>('profile', payload);
  }
}