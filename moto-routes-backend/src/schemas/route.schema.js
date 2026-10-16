import { z } from "zod";
import {
  UNKNOWN_FIELDS_MESSAGE,
  booleanField,
  buildSchemas,
  enumField,
  optionalText,
  optionalUuid,
  requiredNumber,
  requiredText
} from "./common.schema.js";

export const ROUTE_STATUSES = ["borrador", "publicada", "archivada"];

export const routeSchemas = buildSchemas({
  title: requiredText("El título", 120),
  distanceKm: requiredNumber("La distancia", { min: 0, max: 9999.99 }),
  difficulty: enumField(["facil", "media", "dificil"], "La dificultad debe ser: facil, media o dificil"),
  description: optionalText("La descripción", 500),
  status: enumField(ROUTE_STATUSES, "El estado debe ser: borrador, publicada o archivada").optional(),
  isActive: booleanField("El campo isActive").optional(),
  surface: enumField(["asfalto", "mixto", "tierra"], "El firme debe ser: asfalto, mixto o tierra").optional(),
  startPoint: optionalText("El punto de salida", 200),
  estimatedMinutes: requiredNumber("La duración estimada", { min: 1, int: true }).nullable().optional(),
  hostId: optionalUuid("El guía"),
  categoryId: optionalUuid("La categoría"),
  locationId: optionalUuid("La localización")
});

export const routeStatusSchema = z
  .object({
    status: enumField(ROUTE_STATUSES, "El estado debe ser: borrador, publicada o archivada")
  })
  .strict(UNKNOWN_FIELDS_MESSAGE);
