// Todas las variables de entorno en un solo sitio.
export const env = {
  get port() {
    return Number(process.env.PORT) || 3001;
  },
  get corsOrigin() {
    return process.env.CORS_ORIGIN?.split(",") || "http://localhost:4200";
  },
  get groqApiKey() {
    return process.env.GROQ_API_KEY || "";
  },
  get groqModel() {
    return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  },
  get groqBaseUrl() {
    return (process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  },
  get motoRoutesApiUrl() {
    return (process.env.MOTO_ROUTES_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
  },
  get httpTimeoutMs() {
    return Number(process.env.HTTP_TIMEOUT_MS) || 15000;
  },
};
