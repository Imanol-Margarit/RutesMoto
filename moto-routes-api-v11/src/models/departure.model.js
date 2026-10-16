// Tabla: departures. Pertenece a una ruta (ruta_id en la base de datos, routeId en la API).
export const departureModel = {
  table: "departures",
  columns: {
    routeId: "ruta_id",
    slug: "slug",
    startDatetime: "start_datetime",
    endDatetime: "end_datetime",
    capacity: "capacity",
    bookedParticipants: "booked_participants",
    price: "price",
    status: "status",
    isActive: "is_active"
  },
  numeric: ["price"]
};
