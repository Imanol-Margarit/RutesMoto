import { Router } from "express";
import { agentController } from "../controllers/agent.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { chatSchema, slugParamsSchema } from "../schemas/agent.schema.js";

const router = Router();

// Chat público: no necesita sesión.
router.post("/chat", validate(chatSchema), agentController.chat);

// Resumen de los comentarios de una ruta (los comentarios son públicos).
router.get("/comments/:slug/summary", validate(slugParamsSchema, "params"), agentController.commentsSummary);

export default router;
