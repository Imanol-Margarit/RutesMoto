import { Router } from "express";
import { wishlistController } from "../controllers/wishlist.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/authentication.middleware.js";
import { slugParamsSchema } from "../schemas/common.schema.js";

const router = Router();

// Toda la lista de deseos es privada: exige sesión (cualquier rol).
router.use(authenticate);

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Mi lista de deseos (rutas guardadas)
 *     tags: [Lista de deseos]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: "{ count, items }: tarjetas de ruta con addedAt"
 *       401:
 *         description: Sin sesión
 */
router.get("/", wishlistController.list);

/**
 * @swagger
 * /api/wishlist/{slug}:
 *   post:
 *     summary: Guardar una ruta publicada en mi lista (idempotente)
 *     tags: [Lista de deseos]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Slug'
 *     responses:
 *       201:
 *         description: Ruta añadida
 *       200:
 *         description: La ruta ya estaba en la lista
 *       401:
 *         description: Sin sesión
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Quitar una ruta de mi lista
 *     tags: [Lista de deseos]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/Slug'
 *     responses:
 *       200:
 *         description: Ruta quitada
 *       401:
 *         description: Sin sesión
 *       404:
 *         description: La ruta no estaba en la lista
 */
router.post("/:slug", validate(slugParamsSchema, "params"), wishlistController.add);
router.delete("/:slug", validate(slugParamsSchema, "params"), wishlistController.remove);

export default router;
