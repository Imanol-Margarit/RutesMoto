export type HostStatus = 'active' | 'inactive' | 'suspended';

export const HOST_STATUS_LABELS: Record<HostStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido'
};

export const HOST_STATUS_OPTIONS: { value: HostStatus; label: string }[] = [
  { value: 'active', label: HOST_STATUS_LABELS.active },
  { value: 'inactive', label: HOST_STATUS_LABELS.inactive },
  { value: 'suspended', label: HOST_STATUS_LABELS.suspended }
];

/** Guía tal como lo devuelve la API (camelCase). */
export interface Host {
  _id: string;
  userId: string | null;
  name: string;
  slug: string;
  biography: string | null;
  status: HostStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Campos que acepta la API. status e isActive solo se envían al editar. */
export interface HostPayload {
  name: string;
  biography: string | null;
  status?: HostStatus;
  isActive?: boolean;
}
