import { z } from "zod";
import { booleanField, buildSchemas, optionalText, requiredNumber } from "./common.schema.js";

const imageUrl = z
  .string({ required_error: "La URL de la imagen es obligatoria", invalid_type_error: "La URL de la imagen debe ser texto" })
  .trim()
  .min(1, "La URL de la imagen es obligatoria")
  .max(500, "La URL no puede superar los 500 caracteres")
  .url("La URL de la imagen no tiene un formato válido")
  .refine((value) => /^https?:\/\//i.test(value), "La URL debe empezar por http:// o https://");

export const imageSchemas = buildSchemas({
  imageUrl,
  altText: optionalText("El texto alternativo", 200),
  position: requiredNumber("La posición", { min: 0, int: true }).optional(),
  isCover: booleanField("El campo isCover").optional()
});
