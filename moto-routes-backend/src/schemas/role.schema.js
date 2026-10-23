import { booleanField, buildSchemas, optionalText, requiredText } from "./common.schema.js";

export const roleSchemas = buildSchemas({
  name: requiredText("El nombre", 50),
  description: optionalText("La descripción", 500),
  isActive: booleanField("El campo isActive").optional()
});
