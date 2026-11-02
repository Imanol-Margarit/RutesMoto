import { z } from "zod";
import { UNKNOWN_FIELDS_MESSAGE, optionalText, requiredText } from "./common.schema.js";

export const profileSchemas = {
  update: z
    .object({
      firstName: requiredText("El nombre", 100).optional(),
      lastName: requiredText("Los apellidos", 150).optional(),
      phone: optionalText("El teléfono", 30),
      bio: optionalText("La biografía", 2000),
      avatarUrl: z
        .string({ invalid_type_error: "La URL del avatar debe ser texto" })
        .trim()
        .url("La URL del avatar no tiene un formato válido")
        .max(500, "La URL del avatar no puede superar los 500 caracteres")
        .nullable()
        .optional(),
    })
    .partial()
    .strict(UNKNOWN_FIELDS_MESSAGE)
    .refine((data) => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" }),
};
