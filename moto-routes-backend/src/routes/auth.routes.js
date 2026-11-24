import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authentication.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Crear una cuenta de cliente (rol user) e iniciar sesión
 *     description: Fija las cookies HttpOnly access_token (1 h) y refresh_token (7 días). El cuerpo solo devuelve el usuario.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, maxLength: 100, example: Ana }
 *               lastName: { type: string, maxLength: 150, example: Motera }
 *               email: { type: string, format: email, example: ana@motoroutes.local }
 *               password: { type: string, minLength: 8, example: Motoroutes123 }
 *     responses:
 *       201:
 *         description: Cuenta creada y sesión iniciada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Ya existe un usuario con ese email
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión (clientes y administradores)
 *     description: Fija las cookies HttpOnly access_token (1 h) y refresh_token (7 días). El cuerpo solo devuelve el usuario.
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
 *         description: Sesión iniciada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Email o contraseña incorrectos
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar la sesión con la cookie refresh_token (rotación)
 *     description: Revoca el refresh token usado y fija un access_token y un refresh_token nuevos. Reutilizar un refresh ya usado cierra todas las sesiones del usuario.
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Sesión renovada
 *       401:
 *         description: Refresh token ausente, caducado, revocado o reutilizado
 */
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión (revoca el refresh token y borra las cookies)
 *     description: No exige access token, así funciona aunque haya caducado.
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Usuario de la sesión actual (con rol y avatarUrl)
 *     tags: [Autenticación]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: Sin sesión válida (access token ausente o caducado)
 */
router.get("/me", authenticate, authController.me);

export default router;
