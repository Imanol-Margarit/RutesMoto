import "dotenv/config";
import { env } from "./config/env.js";
import { services } from "./config/services.js";
import app from "./app.js";

app.listen(env.port, () => {
  console.log(`API Gateway escuchando en el puerto ${env.port}`);
  for (const service of services) {
    console.log(`  ${service.prefix.padEnd(8)} -> ${service.target}${service.targetPrefix}`);
  }
});
