// Todas las variables de entorno en un solo sitio.
export const env = {
  get port() {
    return Number(process.env.PORT) || 4000;
  },
  get corsOrigin() {
    return process.env.CORS_ORIGIN?.split(",") || "http://localhost:4200";
  },
  get apiServiceUrl() {
    return (process.env.API_SERVICE_URL || "http://localhost:3000").replace(/\/$/, "");
  },
  get aiServiceUrl() {
    return (process.env.AI_SERVICE_URL || "http://localhost:3001").replace(/\/$/, "");
  },
  get proxyTimeoutMs() {
    return Number(process.env.PROXY_TIMEOUT_MS) || 60000;
  },
};
