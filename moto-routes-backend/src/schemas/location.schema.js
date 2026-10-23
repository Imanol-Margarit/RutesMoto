import { z } from "zod";
import {
  UNKNOWN_FIELDS_MESSAGE,
  booleanField,
  buildSchemas,
  enumField,
  optionalText,
  requiredNumber,
  requiredText
} from "./common.schema.js";

export const LOCATION_STATUSES = ["active", "inactive"];
const STATUS_MESSAGE = "El estado debe ser: active o inactive";

export const locationSchemas = buildSchemas({
  city: requiredText("La ciudad", 100),
  region: optionalText("La región", 100),
  country: requiredText("El país", 100),
  address: optionalText("La dirección", 255),
  postalCode: optionalText("El código postal", 20),
  latitude: requiredNumber("La latitud", { min: -90, max: 90 }).nullable().optional(),
  longitude: requiredNumber("La longitud", { min: -180, max: 180 }).nullable().optional(),
  status: enumField(LOCATION_STATUSES, STATUS_MESSAGE).optional(),
  isActive: booleanField("El campo isActive").optional()
});

export const locationStatusSchema = z
  .object({ status: enumField(LOCATION_STATUSES, STATUS_MESSAGE) })
  .strict(UNKNOWN_FIELDS_MESSAGE);
