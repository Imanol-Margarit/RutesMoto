export type RouteDifficulty = 'facil' | 'media' | 'dificil';
export type RouteStatus = 'borrador' | 'publicada' | 'archivada';

/** Qué listado del backend se está viendo en la tabla. */
export type RouteView = 'all' | 'active' | 'inactive' | 'deleted';

export const ROUTE_DIFFICULTIES: readonly RouteDifficulty[] = ['facil', 'media', 'dificil'];
export const ROUTE_STATUSES: readonly RouteStatus[] = ['borrador', 'publicada', 'archivada'];

export const DIFFICULTY_LABELS: Record<RouteDifficulty, string> = {
  facil: 'Fácil',
  media: 'Media',
  dificil: 'Difícil'
};

export const STATUS_LABELS: Record<RouteStatus, string> = {
  borrador: 'Borrador',
  publicada: 'Publicada',
  archivada: 'Archivada'
};

// Se llama MotoRoute (y no Route) para no chocar con el tipo Route de @angular/router.
export interface MotoRoute {
  _id: string;
  title: string;
  region: string;
  distanceKm: number;
  difficulty: RouteDifficulty;
  description: string | null;
  slug: string;
  status: RouteStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Campos que acepta el backend en POST / PATCH (el schema Zod es strict). */
export interface RoutePayload {
  title: string;
  region: string;
  distanceKm: number;
  difficulty: RouteDifficulty;
  description: string | null;
  status: RouteStatus;
  isActive: boolean;
}
