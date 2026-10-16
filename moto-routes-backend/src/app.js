import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import helmet from "helmet";
import { consoleLogger, fileLogger } from "./config/logger.js";
import { swaggerSpec } from "./config/swagger.js";
import routeRoutes from "./routes/route.routes.js";
import departureRoutes from "./routes/departure.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

const corsOptions =
  process.env.NODE_ENV === "development"
    ? { origin: true }
    : { origin: process.env.CORS_ORIGIN?.split(",") || false };

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(helmet({ frameguard: { action: "deny" } }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(consoleLogger);
app.use(fileLogger);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Comprobar que la API responde
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: API en funcionamiento
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API en funcionamiento" });
});

app.use("/api/routes", routeRoutes);
app.use("/api/departures", departureRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
