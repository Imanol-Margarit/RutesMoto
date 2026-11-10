export type ShopDifficulty = 'facil' | 'media' | 'dificil';
export type ShopSurface = 'asfalto' | 'mixto' | 'tierra';
export type ShopSort = 'recent' | 'distance_asc' | 'distance_desc' | 'duration_asc' | 'title_asc';

export interface ShopCategory { _id: string; name: string; slug: string; }
export interface ShopHost { _id: string; name: string; slug: string; biography: string | null; }
export interface ShopLocation { _id: string; city: string; region: string | null; country: string; slug: string; }

/** Ruta en el listado público. */
export interface ShopRoute {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: ShopDifficulty;
  surface: ShopSurface;
  distanceKm: number;
  estimatedMinutes: number | null;
  startPoint: string | null;
  host: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  location: { city: string; country: string; slug: string } | null;
  image: { url: string; alt: string | null } | null;
  minPrice: number | null;
}

export interface ShopPagination { total: number; page: number; limit: number; totalPages: number; }
export interface ShopRouteList { items: ShopRoute[]; pagination: ShopPagination; }

export interface ShopDeparture {
  _id: string;
  startDatetime: string;
  endDatetime: string;
  capacity: number;
  bookedParticipants: number;
  price: number;
  seatsLeft: number;
}

/** Detalle de una ruta: la tarjeta más imágenes y salidas disponibles. */
export interface ShopRouteDetail extends ShopRoute {
  images: { url: string; alt: string | null }[];
  departures: ShopDeparture[];
}

/** Filtros del listado. Son los mismos nombres que la query de la URL. */
export interface ShopFilters {
  search: string;
  category: string;
  host: string;
  location: string;
  difficulty: string;
  surface: string;
  sort: ShopSort;
  page: number;
  limit: number;
}

export const DEFAULT_SHOP_FILTERS: ShopFilters = {
  search: '',
  category: '',
  host: '',
  location: '',
  difficulty: '',
  surface: '',
  sort: 'recent',
  page: 1,
  limit: 9
};
