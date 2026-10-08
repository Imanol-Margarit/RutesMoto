import { z } from "zod";

const difficulties = ["facil", "media", "dificil"];
const statuses = ["borrador", "publicada", "archivada"];

const difficultyMessage = "La dificultad debe ser: facil, media o dificil";
const statusMessage = "El estado debe ser: borrador, publicada o archivada";

const routeFields = {
  title: z
    .string({ required_error: "El título es obligatorio", invalid_type_error: "El título debe ser texto" })
    .trim()
    .min(1, "El título es obligatorio")
    .max(120, "El título no puede superar los 120 caracteres"),
  region: z
    .string({ required_error: "La región es obligatoria", invalid_type_error: "La región debe ser texto" })
    .trim()
    .min(1, "La región es obligatoria")
    .max(80, "La región no puede superar los 80 caracteres"),
  distanceKm: z
    .number({ required_error: "La distancia es obligatoria", invalid_type_error: "La distancia debe ser un número" })
    .finite("La distancia debe ser un número válido")
    .min(0, "La distancia no puede ser negativa"),
  // En los enum solo usamos errorMap (Zod no permite mezclarlo con required_error);
  // el mismo mensaje cubre tanto "falta" como "valor no válido".
  difficulty: z.enum(difficulties, { errorMap: () => ({ message: difficultyMessage }) }),
  description: z
    .string({ invalid_type_error: "La descripción debe ser texto" })
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .nullable()
    .optional(),
  status: z
    .enum(statuses, { errorMap: () => ({ message: statusMessage }) })
    .optional(),
  isActive: z.boolean({ invalid_type_error: "El campo isActive debe ser verdadero o falso" }).optional()
};

const unknownFieldsMessage = "La petición contiene campos no permitidos";

export const createRouteSchema = z.object(routeFields).strict(unknownFieldsMessage);
export const updateRouteSchema = z.object(routeFields).partial().strict(unknownFieldsMessage).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Debes enviar al menos un campo" }
);
export const updateStatusSchema = z
  .object({
    status: z.enum(statuses, { errorMap: () => ({ message: statusMessage }) })
  })
  .strict(unknownFieldsMessage);
export const routeIdParamsSchema = z.object({
  id: z.string({ required_error: "El id es obligatorio" }).uuid("El id debe ser un UUID válido")
});
export const routeSlugParamsSchema = z.object({
  slug: z.string({ required_error: "El slug es obligatorio" }).trim().min(1, "El slug es obligatorio")
});
