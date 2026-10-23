export type LocationStatus = 'active' | 'inactive';

export const LOCATION_STATUS_OPTIONS: { value: LocationStatus; label: string }[] = [
  { value: 'active', label: 'Activa' },
  { value: 'inactive', label: 'Inactiva' }
];

/** Localización tal como la devuelve la API (camelCase). */
export interface Location {
  _id: string;
  city: string;
  region: string | null;
  country: string;
  slug: string;
  address: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  status: LocationStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Campos que acepta la API. status e isActive solo se envían al editar. */
export interface LocationPayload {
  city: string;
  region: string | null;
  country: string;
  address: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  status?: LocationStatus;
  isActive?: boolean;
}
