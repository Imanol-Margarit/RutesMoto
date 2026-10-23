export type DepartureStatus = 'scheduled' | 'full' | 'cancelled' | 'completed';

export const DEPARTURE_STATUS_LABELS: Record<DepartureStatus, string> = {
  scheduled: 'Programada',
  full: 'Completa',
  cancelled: 'Cancelada',
  completed: 'Finalizada'
};

export const DEPARTURE_STATUS_OPTIONS: { value: DepartureStatus; label: string }[] = [
  { value: 'scheduled', label: DEPARTURE_STATUS_LABELS.scheduled },
  { value: 'full', label: DEPARTURE_STATUS_LABELS.full },
  { value: 'cancelled', label: DEPARTURE_STATUS_LABELS.cancelled },
  { value: 'completed', label: DEPARTURE_STATUS_LABELS.completed }
];

export interface DepartureRouteRef {
  _id: string;
  title: string;
  slug: string;
}

export interface Departure {
  _id: string;
  routeId: string;
  slug: string;
  startDatetime: string;
  endDatetime: string;
  capacity: number;
  bookedParticipants: number;
  price: number;
  status: DepartureStatus;
  isActive: boolean;
  route: DepartureRouteRef | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DeparturePayload {
  routeId: string;
  startDatetime: string;
  endDatetime: string;
  capacity: number;
  price?: number;
  bookedParticipants?: number;
  status?: DepartureStatus;
  isActive?: boolean;
}
