import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authentication.middleware.js";
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
 *         description: "Token JWT. Enviarlo en la cabecera Authorization: Bearer <token>"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Email o contraseña incorrectos
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión (revoca el token actual en el servidor)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada
 *       401:
 *         description: Token ausente, inválido, caducado o ya revocado
 */
router.post("/logout", authenticate, authController.logout);
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Usuario de la sesión actual (incluye avatarUrl)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: Sin sesión válida
 */
router.get("/me", authenticate, authController.me);

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Recuperar la sesión activa (token y usuario) a partir de la cookie
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token y datos del usuario
 *       401:
 *         description: Sin sesión válida
 */
router.get("/session", authenticate, authController.session);

export default router;
