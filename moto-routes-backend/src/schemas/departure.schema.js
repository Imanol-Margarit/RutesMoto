import { z } from "zod";
import {
  UNKNOWN_FIELDS_MESSAGE,
  booleanField,
  buildSchemas,
  enumField,
  requiredNumber,
  requiredUuid
} from "./common.schema.js";

const isoDate = (label) =>
  z
    .string({ required_error: `${label} es obligatoria`, invalid_type_error: `${label} debe ser texto` })
    .datetime({ offset: true, message: `${label} debe tener formato ISO 8601, por ejemplo 2026-11-14T09:00:00+01:00` });

const datesInOrder = (data) => new Date(data.endDatetime) > new Date(data.startDatetime);
const DATES_MESSAGE = "La fecha de fin debe ser posterior a la de inicio";

export const departureSchemas = buildSchemas(
  {
    routeId: requiredUuid("La ruta"),
    startDatetime: isoDate("La fecha de inicio"),
    endDatetime: isoDate("La fecha de fin"),
    capacity: requiredNumber("La capacidad", { min: 1, int: true }),
    price: requiredNumber("El precio", { min: 0, max: 999999.99 }).optional(),
    bookedParticipants: requiredNumber("Las plazas reservadas", { min: 0, int: true }).optional(),
    status: enumField(
      ["scheduled", "full", "cancelled", "completed"],
      "El estado debe ser: scheduled, full, cancelled o completed"
    ).optional(),
    isActive: booleanField("El campo isActive").optional()
  },
  {
    refineCreate: { check: datesInOrder, message: DATES_MESSAGE, path: ["endDatetime"] },
    refineUpdate: {
      check: (data) => !(data.startDatetime && data.endDatetime) || datesInOrder(data),
      message: DATES_MESSAGE,
      path: ["endDatetime"]
    }
  }
);

export const DEPARTURE_STATUSES = ["scheduled", "full", "cancelled", "completed"];

export const departureStatusSchema = z
  .object({
    status: enumField(DEPARTURE_STATUSES, "El estado debe ser: scheduled, full, cancelled o completed")
  })
  .strict(UNKNOWN_FIELDS_MESSAGE);