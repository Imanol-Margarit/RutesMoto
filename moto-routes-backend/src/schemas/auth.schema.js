import { z } from "zod";
import { UNKNOWN_FIELDS_MESSAGE, requiredText } from "./common.schema.js";
import { emailField, passwordField } from "./user.schema.js";

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: "El email es obligatorio", invalid_type_error: "El email debe ser texto" })
      .trim()
      .email("El email no tiene un formato válido"),
    password: z
      .string({ required_error: "La contraseña es obligatoria", invalid_type_error: "La contraseña debe ser texto" })
      .min(1, "La contraseña es obligatoria")
  })
  .strict(UNKNOWN_FIELDS_MESSAGE);

// Registro público: el rol no se envía, siempre es "user" (cliente).
export const registerSchema = z
  .object({
    firstName: requiredText("El nombre", 100),
    lastName: requiredText("Los apellidos", 150),
    email: emailField,
    password: passwordField
  })
  .strict(UNKNOWN_FIELDS_MESSAGE);
