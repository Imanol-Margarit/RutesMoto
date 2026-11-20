import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import agentRoutes from "./routes/agent.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet({ frameguard: { action: "deny" } }));
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "50kb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Agente IA en funcionamiento" });
});

app.use("/api/agent", agentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
