import { Router } from "express";
import { imageController } from "../controllers/image.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { imageParamsSchema } from "../schemas/common.schema.js";
import { imageSchemas } from "../schemas/image.schema.js";

// mergeParams: el :id viene de la ruta de la que cuelgan las imágenes.
const router = Router({ mergeParams: true });

/**
 * @swagger
 * /api/routes/{id}/images:
 *   get:
 *     summary: Listar las imágenes de una ruta
 *     tags: [Imágenes de rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     responses:
 *       200:
 *         description: Listado de imágenes ordenado por position
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { type: array, items: { $ref: '#/components/schemas/RouteImage' } }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     summary: Añadir una imagen a una ruta
 *     description: Si isCover es true, la imagen principal anterior deja de serlo.
 *     tags: [Imágenes de rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageInput' }
 *     responses:
 *       201:
 *         description: Imagen añadida
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/", imageController.list);
router.post("/", validate(imageSchemas.create), imageController.add);

/**
 * @swagger
 * /api/routes/{id}/images/{imageId}:
 *   patch:
 *     summary: Editar una imagen de una ruta
 *     tags: [Imágenes de rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *       - $ref: '#/components/parameters/ImageId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageUpdate' }
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una imagen de una ruta (soft delete)
 *     tags: [Imágenes de rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *       - $ref: '#/components/parameters/ImageId'
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:imageId", validate(imageParamsSchema, "params"), validate(imageSchemas.update), imageController.update);
router.delete("/:imageId", validate(imageParamsSchema, "params"), imageController.remove);

export default router;
