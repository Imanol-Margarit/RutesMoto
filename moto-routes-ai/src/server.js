import "dotenv/config";
import { env } from "./config/env.js";
import app from "./app.js";

if (!env.groqApiKey) {
  console.warn("Aviso: falta GROQ_API_KEY en el .env. El chat responderá con error hasta que la añadas.");
}

app.listen(env.port, () => {
  console.log(`Agente IA escuchando en el puerto ${env.port} (modelo ${env.groqModel})`);
});
