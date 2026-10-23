import { Router } from "express";
import { routeController } from "../controllers/route.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { routeSchemas, routeStatusSchema } from "../schemas/route.schema.js";
import imageRoutes from "./image.routes.js";

const router = Router();

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Listar las rutas no borradas (activas e inactivas)
 *     tags: [Rutas]
 *     responses:
 *       200:
 *         description: Listado de rutas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Route' } }
 *   post:
 *     summary: Crear una ruta
 *     tags: [Rutas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteInput' }
 *     responses:
 *       201:
 *         description: Ruta creada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", routeController.list);
router.post("/", validate(routeSchemas.create), routeController.create);

/**
 * @swagger
 * /api/routes/active:
 *   get:
 *     summary: Listar solo las rutas activas
 *     tags: [Rutas]
 *     responses:
 *       200:
 *         description: Rutas con isActive = true
 */
router.get("/active", routeController.listActive);

/**
 * @swagger
 * /api/routes/inactive:
 *   get:
 *     summary: Listar solo las rutas inactivas
 *     tags: [Rutas]
 *     responses:
 *       200:
 *         description: Rutas con isActive = false
 */
router.get("/inactive", routeController.listInactive);

/**
 * @swagger
 * /api/routes/deleted:
 *   get:
 *     summary: Listar las rutas borradas (papelera)
 *     tags: [Rutas]
 *     responses:
 *       200:
 *         description: Rutas con deletedAt distinto de null
 */
router.get("/deleted", routeController.listDeleted);

/**
 * @swagger
 * /api/routes/slug/{slug}:
 *   get:
 *     summary: Obtener una ruta por su slug
 *     tags: [Rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/Slug'
 *     responses:
 *       200:
 *         description: Ruta encontrada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/slug/:slug", validate(slugParamsSchema, "params"), routeController.getBySlug);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Obtener una ruta por id
 *     tags: [Rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     responses:
 *       200:
 *         description: Ruta encontrada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Editar una ruta (solo los campos enviados)
 *     tags: [Rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteInput' }
 *     responses:
 *       200:
 *         description: Ruta actualizada. Si cambia el título, el slug se regenera.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una ruta (soft delete, pasa a la papelera)
 *     tags: [Rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     responses:
 *       200:
 *         description: Ruta eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(uuidParamsSchema, "params"), routeController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(routeSchemas.update), routeController.update);
router.delete("/:id", validate(uuidParamsSchema, "params"), routeController.remove);

/**
 * @swagger
 * /api/routes/{id}/status:
 *   patch:
 *     summary: Cambiar el estado editorial de una ruta
 *     tags: [Rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteStatusInput' }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch("/:id/status", validate(uuidParamsSchema, "params"), validate(routeStatusSchema), routeController.setStatus);

/**
 * @swagger
 * /api/routes/{id}/activate:
 *   patch:
 *     summary: Activar una ruta (isActive = true)
 *     tags: [Rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     responses:
 *       200:
 *         description: Ruta activada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), routeController.activate);

/**
 * @swagger
 * /api/routes/{id}/deactivate:
 *   patch:
 *     summary: Desactivar una ruta (isActive = false)
 *     tags: [Rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     responses:
 *       200:
 *         description: Ruta desactivada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), routeController.deactivate);

/**
 * @swagger
 * /api/routes/{id}/restore:
 *   patch:
 *     summary: Restaurar una ruta de la papelera
 *     tags: [Rutas]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     responses:
 *       200:
 *         description: Ruta restaurada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), routeController.restore);

// Imágenes de una ruta: /api/routes/{id}/images (ver image.routes.js)
router.use("/:id/images", validate(uuidParamsSchema, "params"), imageRoutes);

export default router;
