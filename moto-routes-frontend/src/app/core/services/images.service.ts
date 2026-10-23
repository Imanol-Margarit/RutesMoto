import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { EntityImage, EntityImagePayload } from '../models/entity-image.model';

/**
 * Imágenes de cualquier entidad. La ruta base se pasa en cada llamada,
 * por ejemplo 'hosts/<id>/images' o 'routes/<id>/images'.
 */
@Injectable({ providedIn: 'root' })
export class ImagesService {
  private readonly api = inject(ApiService);

  list(basePath: string): Promise<ApiResponse<EntityImage[]>> {
    return this.api.get<ApiResponse<EntityImage[]>>(basePath);
  }

  create(basePath: string, payload: EntityImagePayload): Promise<ApiResponse<EntityImage>> {
    return this.api.post<ApiResponse<EntityImage>>(basePath, payload);
  }

  update(basePath: string, imageId: string, payload: Partial<EntityImagePayload>): Promise<ApiResponse<EntityImage>> {
    return this.api.patch<ApiResponse<EntityImage>>(`${basePath}/${imageId}`, payload);
  }

  remove(basePath: string, imageId: string): Promise<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(`${basePath}/${imageId}`);
  }
}
