import { createChatCompletion } from "../clients/groq.client.js";
import { buildSystemPrompt } from "../agent/system-prompt.js";
import { runTool, toolDefinitions } from "../agent/tools.js";

// Vueltas máximas de "el modelo pide una herramienta -> se ejecuta -> se le devuelve el resultado".
const MAX_TOOL_ROUNDS = 5;
// Solo se envían a la IA los últimos mensajes del historial.
const HISTORY_LIMIT = 12;

/** Datos de una ruta que necesita el frontend para pintar su tarjeta o su marcador en el mapa. */
function toRouteLink(route) {
  return {
    title: route.title,
    slug: route.slug,
    difficulty: route.difficulty,
    distanceKm: route.distanceKm,
    minPrice: route.minPrice ?? null,
    image: route.image ?? null,
    location: route.location
      ? {
          city: route.location.city,
          latitude: route.location.latitude ?? null,
          longitude: route.location.longitude ?? null,
        }
      : null,
  };
}

/** Se queda solo con las rutas que el modelo ha nombrado en su respuesta (si no nombra ninguna, todas). */
function pickMentionedRoutes(routes, reply) {
  const text = reply.toLowerCase();
  const mentioned = routes.filter((route) => text.includes(route.title.toLowerCase()));
  return mentioned.length ? mentioned : routes;
}

export const agentService = {
  /**
   * messages: [{ role: "user" | "assistant", content }], el último es del usuario.
   * Devuelve { reply, routes }.
   */
  async chat(history) {
    const routesBySlug = new Map();
    const context = {
      addRoute(route) {
        if (route?.slug) routesBySlug.set(route.slug, toRouteLink(route));
      },
    };

    const messages = [
      { role: "system", content: buildSystemPrompt() },
      ...history.slice(-HISTORY_LIMIT).map(({ role, content }) => ({ role, content })),
    ];

    let reply = null;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const message = await createChatCompletion({ messages, tools: toolDefinitions });
      const toolCalls = message.tool_calls ?? [];

      if (!toolCalls.length) {
        reply = message.content;
        break;
      }

      // Se guarda la petición del modelo y, después, la respuesta de cada herramienta.
      messages.push({ role: "assistant", content: message.content ?? "", tool_calls: toolCalls });

      const results = await Promise.all(
        toolCalls.map((call) => runTool(call.function.name, call.function.arguments, context))
      );

      toolCalls.forEach((call, index) => {
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(results[index]) });
      });
    }

    // Si se han agotado las vueltas, se pide la respuesta final sin herramientas.
    if (reply === null) {
      const message = await createChatCompletion({ messages });
      reply = message.content;
    }

    reply = reply?.trim() || "No he podido generar una respuesta. ¿Puedes reformular la pregunta?";
    const routes = pickMentionedRoutes([...routesBySlug.values()], reply);

    return { reply, routes };
  },
};
