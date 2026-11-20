import { Router } from "express";
import { agentController } from "../controllers/agent.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { chatSchema } from "../schemas/agent.schema.js";

const router = Router();

// Chat público: no necesita sesión.
router.post("/chat", validate(chatSchema), agentController.chat);

export default router;
