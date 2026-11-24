import { env } from "../config/env.js";
import { fetchJson, HttpError } from "../utils/http.util.js";
import { AppError } from "../utils/app-error.js";

/**
 * Llama a Groq. Su API es compatible con la de OpenAI (/chat/completions),
 * así que no hace falta ningún SDK: basta con fetch.
 * Devuelve el mensaje del asistente: { role, content, tool_calls? }.
 */
export async function createChatCompletion({ messages, tools, maxTokens = 1024 }) {
  if (!env.groqApiKey) {
    throw new AppError("El agente no está configurado: falta GROQ_API_KEY", 500);
  }

  const body = {
    model: env.groqModel,
    messages,
    temperature: 0.3,
    max_completion_tokens: maxTokens,
  };
  if (tools?.length) {
    body.tools = tools;
    body.tool_choice = "auto";
  }
  // Los modelos gpt-oss "piensan" antes de responder; con low van más rápido.
  if (env.groqModel.startsWith("openai/gpt-oss")) {
    body.reasoning_effort = "low";
  }

  try {
    const data = await fetchJson(`${env.groqBaseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.groqApiKey}` },
      body,
    });
    return data.choices[0].message;
  } catch (error) {
    throw toAppError(error);
  }
}

function toAppError(error) {
  if (error instanceof AppError) return error;

  if (error.name === "TimeoutError") {
    return new AppError("La IA ha tardado demasiado en responder, inténtalo de nuevo", 504);
  }
  if (error instanceof HttpError) {
    console.error("Error de Groq:", error.status, JSON.stringify(error.body));
    if (error.status === 401) return new AppError("La clave de Groq no es válida", 500);
    if (error.status === 429) return new AppError("La IA está saturada ahora mismo, prueba en unos segundos", 503);
    if (error.body?.error?.code === "tool_use_failed") {
      return new AppError("La IA no ha entendido bien la consulta, prueba a reformularla", 502);
    }
    return new AppError("La IA no está disponible ahora mismo", 502);
  }

  console.error("No se pudo conectar con Groq:", error);
  return new AppError("No se pudo conectar con la IA", 502);
}
