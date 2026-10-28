import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener un token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: admin@motoroutes.local }
 *               password: { type: string, example: Motoroutes123 }
 *     responses:
 *       200:
 *         description: Token JWT. Enviarlo en la cabecera Authorization: Bearer <token>
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Email o contraseña incorrectos
 */
router.post("/login", validate(loginSchema), authController.login);

export default router;
