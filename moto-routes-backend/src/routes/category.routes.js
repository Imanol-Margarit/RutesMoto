import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createImageRoutes } from "./image.routes.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { categorySchemas } from "../schemas/category.schema.js";

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Listar las categorías no borradas
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Listado de categorías
 *   post:
 *     summary: Crear una categoría
 *     tags: [Categorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CategoryInput' }
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", categoryController.list);
router.post("/", validate(categorySchemas.create), categoryController.create);

/**
 * @swagger
 * /api/categories/active:
 *   get:
 *     summary: Listar solo las categorías activas
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Categorías con isActive = true
 */
router.get("/active", categoryController.listActive);

/**
 * @swagger
 * /api/categories/inactive:
 *   get:
 *     summary: Listar solo las categorías inactivas
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Categorías con isActive = false
 */
router.get("/inactive", categoryController.listInactive);

/**
 * @swagger
 * /api/categories/deleted:
 *   get:
 *     summary: Listar las categorías borradas (papelera)
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Categorías con deletedAt distinto de null
 */
router.get("/deleted", categoryController.listDeleted);

/**
 * @swagger
 * /api/categories/slug/{slug}:
 *   get:
 *     summary: Obtener una categoría por su slug
 *     tags: [Categorías]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/slug/:slug", validate(slugParamsSchema, "params"), categoryController.getBySlug);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener una categoría por id
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Editar una categoría (solo los campos enviados)
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CategoryInput' }
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una categoría (soft delete)
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(uuidParamsSchema, "params"), categoryController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(categorySchemas.update), categoryController.update);
router.delete("/:id", validate(uuidParamsSchema, "params"), categoryController.remove);

/**
 * @swagger
 * /api/categories/{id}/activate:
 *   patch:
 *     summary: Activar una categoría
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Categoría activada
 */
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), categoryController.activate);

/**
 * @swagger
 * /api/categories/{id}/deactivate:
 *   patch:
 *     summary: Desactivar una categoría
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Categoría desactivada
 */
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), categoryController.deactivate);

/**
 * @swagger
 * /api/categories/{id}/restore:
 *   patch:
 *     summary: Restaurar una categoría de la papelera
 *     tags: [Categorías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Categoría restaurada
 */
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), categoryController.restore);

/**
 * Imágenes de un category: /api/categorys/:id/images
 */
router.use("/:id/images", validate(uuidParamsSchema, "params"), createImageRoutes("category"));

export default router;
