import { booleanField, buildSchemas, optionalText, requiredText } from "./common.schema.js";

export const categorySchemas = buildSchemas({
  name: requiredText("El nombre", 60),
  description: optionalText("La descripción", 500),
  isActive: booleanField("El campo isActive").optional()
});
