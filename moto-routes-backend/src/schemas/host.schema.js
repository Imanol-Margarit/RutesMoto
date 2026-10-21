import { z } from "zod";
import {
  UNKNOWN_FIELDS_MESSAGE,
  booleanField,
  buildSchemas,
  enumField,
  optionalText,
  optionalUuid,
  requiredText
} from "./common.schema.js";

export const HOST_STATUSES = ["active", "inactive", "suspended"];
const STATUS_MESSAGE = "El estado debe ser: active, inactive o suspended";

export const hostSchemas = buildSchemas({
  userId: optionalUuid("El usuario"),
  name: requiredText("El nombre", 100),
  biography: optionalText("La biografía", 1000),
  status: enumField(HOST_STATUSES, STATUS_MESSAGE).optional(),
  isActive: booleanField("El campo isActive").optional()
});

export const hostStatusSchema = z
  .object({ status: enumField(HOST_STATUSES, STATUS_MESSAGE) })
  .strict(UNKNOWN_FIELDS_MESSAGE);
