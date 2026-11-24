import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/authentication.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { commentSchemas } from "../schemas/comment.schema.js";

const router = Router();

// Leer es público (se ven en el detalle de la tienda). Escribir exige sesión (cualquier rol).

/**
 * @swagger
 * /api/comments/route/{slug}:
 *   get:
 *     summary: Comentarios de una ruta publicada, con la media de valoraciones
 *     tags: [Comentarios]
 *     parameters:
 *       - $ref: '#/components/parameters/Slug'
 *     responses:
 *       200:
 *         description: "{ route, stats: { count, average }, items }"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     summary: Publicar un comentario en una ruta (usuario logueado)
 *     description: El autor sale de la sesión. Un usuario solo puede tener un comentario por ruta.
 *     tags: [Comentarios]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Slug'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CommentInput' }
 *     responses:
 *       201:
 *         description: Comentario creado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Sin sesión
 *       409:
 *         description: Ya has comentado esta ruta
 */
router.get("/route/:slug", validate(slugParamsSchema, "params"), commentController.listByRoute);
router.post("/route/:slug", authenticate, validate(slugParamsSchema, "params"), validate(commentSchemas.create), commentController.create);

/**
 * @swagger
 * /api/comments/{id}:
 *   patch:
 *     summary: Editar tu comentario (solo el autor)
 *     tags: [Comentarios]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CommentInput' }
 *     responses:
 *       200:
 *         description: Comentario actualizado
 *       403:
 *         description: No eres el autor
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar un comentario (autor, admin o host) - soft delete
 *     tags: [Comentarios]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Comentario eliminado
 *       403:
 *         description: No tienes permiso
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id", authenticate, validate(uuidParamsSchema, "params"),validate(commentSchemas.update), commentController.update);
router.delete("/:id", authenticate, validate(uuidParamsSchema, "params"), commentController.remove);

export default router;
