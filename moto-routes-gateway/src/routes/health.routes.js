import { Router } from "express";
import { services } from "../config/services.js";

const router = Router();

/** Estado del gateway y de cada microservicio. */
router.get("/", async (_req, res) => {
  const checks = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(`${service.target}${service.healthPath}`, { signal: AbortSignal.timeout(3000) });
        return { name: service.name, url: service.target, up: response.ok };
      } catch {
        return { name: service.name, url: service.target, up: false };
      }
    })
  );

  const allUp = checks.every((check) => check.up);
  res.status(allUp ? 200 : 503).json({
    success: allUp,
    message: allUp ? "Todos los servicios funcionan" : "Algún servicio no responde",
    data: checks,
  });
});

export default router;
