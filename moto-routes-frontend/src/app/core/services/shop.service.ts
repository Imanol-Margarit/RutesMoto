import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';
import {
  DEFAULT_SHOP_FILTERS,
  ShopCategory,
  ShopDeparture,
  ShopFilters,
  ShopHost,
  ShopLocation,
  ShopRouteDetail,
  ShopRouteList
} from '../models/shop.model';

@Injectable({ providedIn: 'root' })
export class ShopService {
  private readonly api = inject(ApiService);

  getCategories(): Promise<ApiResponse<ShopCategory[]>> {
    return this.api.get<ApiResponse<ShopCategory[]>>('shop/categories');
  }

  getHosts(): Promise<ApiResponse<ShopHost[]>> {
    return this.api.get<ApiResponse<ShopHost[]>>('shop/hosts');
  }

  getLocations(): Promise<ApiResponse<ShopLocation[]>> {
    return this.api.get<ApiResponse<ShopLocation[]>>('shop/locations');
  }

  /** Listado para la portada (sin cancelación). */
  getRoutes(filters: Partial<ShopFilters>): Promise<ApiResponse<ShopRouteList>> {
    return this.api.get<ApiResponse<ShopRouteList>>('shop/routes', toQueryParams(filters));
  }

  /**
   * Listado del catálogo con AbortController: si el usuario cambia un filtro mientras se carga,
   * la petición anterior se cancela de verdad (no solo se ignora su respuesta).
   */
  async getRoutesAbortable(filters: Partial<ShopFilters>, signal: AbortSignal): Promise<ApiResponse<ShopRouteList>> {
    const url = new URL(`${environment.apiUrl}/shop/routes`);
    for (const [key, value] of Object.entries(toQueryParams(filters))) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url.toString(), { signal, headers: { Accept: 'application/json' } });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.message ?? `HTTP ${response.status}`);
    return body as ApiResponse<ShopRouteList>;
  }

  getRouteDetail(slug: string): Promise<ApiResponse<ShopRouteDetail>> {
    return this.api.get<ApiResponse<ShopRouteDetail>>(`shop/routes/${encodeURIComponent(slug)}`);
  }

  getRouteDepartures(slug: string): Promise<ApiResponse<ShopDeparture[]>> {
    return this.api.get<ApiResponse<ShopDeparture[]>>(`shop/routes/${encodeURIComponent(slug)}/departures`);
  }
}

/** Convierte los filtros en parámetros de query, omitiendo los vacíos y los valores por defecto. */
export function toQueryParams(filters: Partial<ShopFilters>): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    if (key !== 'page' && value === DEFAULT_SHOP_FILTERS[key as keyof ShopFilters]) continue;
    params[key] = value as string | number;
  }
  return params;
}
