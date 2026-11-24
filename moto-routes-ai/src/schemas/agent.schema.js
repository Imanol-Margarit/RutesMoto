import { z } from "zod";

export const MAX_MESSAGES = 20;

/** Params de GET /api/agent/comments/:slug/summary. */
export const slugParamsSchema = z.object({
  slug: z.string().trim().min(1, "El slug es obligatorio").max(160, "El slug es demasiado largo"),
});
export const MAX_MESSAGE_LENGTH = 2000;

const messageSchema = z
  .object({
    role: z.enum(["user", "assistant"], {
      errorMap: () => ({ message: "role debe ser user o assistant" }),
    }),
    content: z
      .string({ required_error: "content es obligatorio" })
      .trim()
      .min(1, "El mensaje no puede estar vacío")
      .max(MAX_MESSAGE_LENGTH, `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres`),
  })
  .strict();

/** Body de POST /api/agent/chat: el historial de la conversación, el último mensaje es del usuario. */
export const chatSchema = z
  .object({
    messages: z
      .array(messageSchema, { required_error: "messages es obligatorio" })
      .min(1, "Envía al menos un mensaje")
      .max(MAX_MESSAGES, `No se pueden enviar más de ${MAX_MESSAGES} mensajes`)
      .refine((messages) => messages.at(-1)?.role === "user", {
        message: "El último mensaje debe ser del usuario",
      }),
  })
  .strict();
