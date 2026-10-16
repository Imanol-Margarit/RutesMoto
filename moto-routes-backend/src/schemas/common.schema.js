import { z } from "zod";

export const UNKNOWN_FIELDS_MESSAGE = "La petición contiene campos no permitidos";
const EMPTY_UPDATE_MESSAGE = "Debes enviar al menos un campo";

// "La ..." (femenino) lleva "obligatoria"; el resto, "obligatorio".
const requiredWord = (label) => (/^La /.test(label) ? "obligatoria" : "obligatorio");

export const uuidParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido")
});

export const slugParamsSchema = z.object({
  slug: z.string().trim().min(1, "El slug es obligatorio")
});

export const imageParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
  imageId: z.string().uuid("El id de la imagen debe ser un UUID válido")
});

export const requiredText = (label, max) =>
  z
    .string({ required_error: `${label} es ${requiredWord(label)}`, invalid_type_error: `${label} debe ser texto` })
    .trim()
    .min(1, `${label} es ${requiredWord(label)}`)
    .max(max, `${label} no puede superar los ${max} caracteres`);

// Texto opcional: "" se guarda como null.
export const optionalText = (label, max) =>
  z
    .string({ invalid_type_error: `${label} debe ser texto` })
    .trim()
    .max(max, `${label} no puede superar los ${max} caracteres`)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

export const requiredUuid = (label) =>
  z
    .string({ required_error: `${label} es ${requiredWord(label)}`, invalid_type_error: `${label} debe ser texto` })
    .uuid(`${label} no tiene un formato válido`);

export const optionalUuid = (label) =>
  z
    .string({ invalid_type_error: `${label} debe ser texto` })
    .uuid(`${label} no tiene un formato válido`)
    .nullable()
    .optional();

export const enumField = (values, message) => z.enum(values, { errorMap: () => ({ message }) });

export const booleanField = (label) =>
  z.boolean({ invalid_type_error: `${label} debe ser verdadero o falso` });

export const requiredNumber = (label, { min, max, int = false } = {}) => {
  let schema = z
    .number({ required_error: `${label} es ${requiredWord(label)}`, invalid_type_error: `${label} debe ser un número` })
    .finite(`${label} debe ser un número válido`);

  if (int) schema = schema.int(`${label} debe ser un número entero`);

  const range =
    min !== undefined && max !== undefined
      ? `entre ${min} y ${max}`
      : min !== undefined
        ? `mayor o igual que ${min}`
        : `menor o igual que ${max}`;

  if (min !== undefined) schema = schema.min(min, `${label} debe ser ${range}`);
  if (max !== undefined) schema = schema.max(max, `${label} debe ser ${range}`);
  return schema;
};

const refineOptions = (rule) => (rule.path ? { message: rule.message, path: rule.path } : { message: rule.message });

/**
 * Crea los schemas de creación y edición a partir de los campos.
 * - create: los campos sin .optional() son obligatorios.
 * - update: todos opcionales, y tiene que venir al menos un campo.
 * Ambos son estrictos: un campo desconocido devuelve 400.
 */
export function buildSchemas(fields, { refineCreate, refineUpdate } = {}) {
  let create = z.object(fields).strict(UNKNOWN_FIELDS_MESSAGE);
  if (refineCreate) create = create.refine(refineCreate.check, refineOptions(refineCreate));

  let update = z
    .object(fields)
    .partial()
    .strict(UNKNOWN_FIELDS_MESSAGE)
    .refine((data) => Object.keys(data).length > 0, { message: EMPTY_UPDATE_MESSAGE });
  if (refineUpdate) update = update.refine(refineUpdate.check, refineOptions(refineUpdate));

  return { create, update };
}
