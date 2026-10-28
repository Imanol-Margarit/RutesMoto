import { Router } from "express";
import { profileController } from "../controllers/profile.controller.js";
import { authenticate } from "../middlewares/authentication.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { profileSchemas } from "../schemas/profile.schema.js";

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
 *         description: Perfil del usuario (phone, bio y avatarUrl)
 *       401:
 *         description: Token ausente, inválido, caducado o revocado
 *   put:
 *     summary: Actualizar el perfil del usuario autenticado (solo los campos enviados)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               phone: { type: string, nullable: true, maxLength: 30 }
 *               bio: { type: string, nullable: true, maxLength: 2000 }
 *               avatarUrl: { type: string, format: uri, nullable: true, maxLength: 500 }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Token ausente, inválido, caducado o revocado
 */
router.get("/", authenticate, profileController.getMe);
router.put("/", authenticate, validate(profileSchemas.update), profileController.updateMe);

export default router;
