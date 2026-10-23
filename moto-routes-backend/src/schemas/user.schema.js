import { z } from "zod";
import {
  UNKNOWN_FIELDS_MESSAGE,
  booleanField,
  optionalText,
  requiredText,
  requiredUuid
} from "./common.schema.js";

const email = z
  .string({ required_error: "El email es obligatorio", invalid_type_error: "El email debe ser texto" })
  .trim()
  .min(1, "El email es obligatorio")
  .max(150, "El email no puede superar los 150 caracteres")
  .email("El email no tiene un formato válido")
  .transform((value) => value.toLowerCase());

const avatarUrl = z
  .string({ invalid_type_error: "La URL del avatar debe ser texto" })
  .trim()
  .url("La URL del avatar no tiene un formato válido")
  .max(500, "La URL del avatar no puede superar los 500 caracteres")
  .nullable()
  .optional();

const password = z
  .string({ required_error: "La contraseña es obligatoria", invalid_type_error: "La contraseña debe ser texto" })
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(100, "La contraseña no puede superar los 100 caracteres");

const base = {
  roleId: requiredUuid("El rol"),
  firstName: requiredText("El nombre", 100),
  lastName: requiredText("Los apellidos", 150),
  email,
  avatarUrl,
  isActive: booleanField("El campo isActive").optional()
};

// Al crear, la contraseña es obligatoria. Al editar, es opcional.
export const userSchemas = {
  create: z.object({ ...base, password }).strict(UNKNOWN_FIELDS_MESSAGE),
  update: z
    .object({ ...base, password: password.optional() })
    .partial()
    .strict(UNKNOWN_FIELDS_MESSAGE)
    .refine((data) => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" })
};
