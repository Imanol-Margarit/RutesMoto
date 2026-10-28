import { Router } from "express";
import { profileController } from "../controllers/profile.controller.js";
import { authenticate } from "../middlewares/authentication.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario (sin contraseña)
 *       401:
 *         description: Token ausente, inválido o caducado
 */
router.get("/", authenticate, profileController.getMe);

export default router;
