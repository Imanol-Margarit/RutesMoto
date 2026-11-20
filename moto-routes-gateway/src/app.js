import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { services } from "./config/services.js";
import { proxyTo } from "./middlewares/proxy.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

// Así req.protocol y las IPs respetan X-Forwarded-* si algún día hay otro proxy delante.
app.set("trust proxy", true);

// CORS centralizado: Angular solo habla con el gateway. credentials para la cookie de sesión.
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(morgan("dev"));

// Endpoint propio del gateway (va antes de los proxies para que no se reenvíe).
app.use("/gateway/health", healthRoutes);

// Un proxy por microservicio, en el orden de la tabla (primero /api/ia, después /api).
// IMPORTANTE: sin express.json() delante, el body se reenvía sin tocar.
for (const service of services) {
  app.use(service.prefix, proxyTo(service));
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
