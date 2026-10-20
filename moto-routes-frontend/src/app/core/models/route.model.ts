export type RouteDifficulty = 'facil' | 'media' | 'dificil';
export type RouteSurface = 'asfalto' | 'mixto' | 'tierra';
export type RouteStatus = 'borrador' | 'publicada' | 'archivada';

export interface Option<T extends string> {
  value: T;
  label: string;
}

export const DIFFICULTY_LABELS: Record<RouteDifficulty, string> = {
  facil: 'Fácil',
  media: 'Media',
  dificil: 'Difícil'
};

export const SURFACE_LABELS: Record<RouteSurface, string> = {
  asfalto: 'Asfalto',
  mixto: 'Mixto',
  tierra: 'Tierra'
};

export const STATUS_LABELS: Record<RouteStatus, string> = {
  borrador: 'Borrador',
  publicada: 'Publicada',
  archivada: 'Archivada'
};

export const DIFFICULTY_OPTIONS: Option<RouteDifficulty>[] = [
  { value: 'facil', label: DIFFICULTY_LABELS.facil },
  { value: 'media', label: DIFFICULTY_LABELS.media },
  { value: 'dificil', label: DIFFICULTY_LABELS.dificil }
];

export const SURFACE_OPTIONS: Option<RouteSurface>[] = [
  { value: 'asfalto', label: SURFACE_LABELS.asfalto },
  { value: 'mixto', label: SURFACE_LABELS.mixto },
  { value: 'tierra', label: SURFACE_LABELS.tierra }
];

export const STATUS_OPTIONS: Option<RouteStatus>[] = [
  { value: 'borrador', label: STATUS_LABELS.borrador },
  { value: 'publicada', label: STATUS_LABELS.publicada },
  { value: 'archivada', label: STATUS_LABELS.archivada }
];

/** Ruta tal como la devuelve la API (camelCase). */
export interface MotoRoute {
  _id: string;
  title: string;
  distanceKm: number;
  difficulty: RouteDifficulty;
  description: string | null;
  slug: string;
  surface: RouteSurface;
  startPoint: string | null;
  estimatedMinutes: number | null;
  status: RouteStatus;
  isActive: boolean;
  hostId: string | null;
  categoryId: string | null;
  locationId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Campos que acepta la API. status e isActive solo se envían al editar. */
export interface RoutePayload {
  title: string;
  distanceKm: number;
  difficulty: RouteDifficulty;
  description: string | null;
  surface: RouteSurface;
  startPoint: string | null;
  estimatedMinutes: number | null;
  hostId?: string | null;
  categoryId?: string | null;
  locationId?: string | null;
  status?: RouteStatus;
  isActive?: boolean;
}
