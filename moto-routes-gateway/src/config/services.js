import { env } from "./env.js";

/**
 * Tabla de enrutado del gateway.
 * - prefix: lo que llama Angular en el gateway.
 * - target + targetPrefix: a dónde se reenvía.
 *
 *   /api/ia/agent/chat  ->  http://localhost:3001/api/agent/chat
 *   /api/routes?page=2  ->  http://localhost:3000/api/routes?page=2
 *
 * El orden importa: primero el prefijo más concreto (/api/ia) y después el general (/api).
 */
export const services = [
  {
    name: "Agente IA",
    prefix: "/api/ia",
    target: env.aiServiceUrl,
    targetPrefix: "/api",
    healthPath: "/api/health",
  },
  {
    name: "API Moto Routes",
    prefix: "/api",
    target: env.apiServiceUrl,
    targetPrefix: "/api",
    healthPath: "/api/health",
  },
];
