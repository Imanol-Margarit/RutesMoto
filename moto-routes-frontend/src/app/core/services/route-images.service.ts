import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { RouteImage, RouteImagePayload } from '../models/route-image.model';

/** Imágenes de una ruta: /api/routes/:id/images */
@Injectable({ providedIn: 'root' })
export class RouteImagesService {
  private readonly api = inject(ApiService);

  getByRoute(routeId: string): Promise<ApiResponse<RouteImage[]>> {
    return this.api.get<ApiResponse<RouteImage[]>>(`routes/${routeId}/images`);
  }

  create(routeId: string, payload: RouteImagePayload): Promise<ApiResponse<RouteImage>> {
    return this.api.post<ApiResponse<RouteImage>>(`routes/${routeId}/images`, payload);
  }

  update(routeId: string, imageId: string, payload: Partial<RouteImagePayload>): Promise<ApiResponse<RouteImage>> {
    return this.api.patch<ApiResponse<RouteImage>>(`routes/${routeId}/images/${imageId}`, payload);
  }

  remove(routeId: string, imageId: string): Promise<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(`routes/${routeId}/images/${imageId}`);
  }
}
