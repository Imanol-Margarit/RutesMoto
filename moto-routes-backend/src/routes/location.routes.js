import { Router } from "express";
import { locationController } from "../controllers/location.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { locationSchemas, locationStatusSchema } from "../schemas/location.schema.js";

const router = Router();

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Listar las localizaciones no borradas
 *     tags: [Localizaciones]
 *     responses:
 *       200:
 *         description: Listado de localizaciones
 *   post:
 *     summary: Crear una localización
 *     tags: [Localizaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LocationInput' }
 *     responses:
 *       201:
 *         description: Localización creada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", locationController.list);
router.post("/", validate(locationSchemas.create), locationController.create);

/**
 * @swagger
 * /api/locations/active:
 *   get:
 *     summary: Listar solo las localizaciones activas
 *     tags: [Localizaciones]
 *     responses:
 *       200:
 *         description: Localizaciones con isActive = true
 */
router.get("/active", locationController.listActive);

/**
 * @swagger
 * /api/locations/inactive:
 *   get:
 *     summary: Listar solo las localizaciones inactivas
 *     tags: [Localizaciones]
 *     responses:
 *       200:
 *         description: Localizaciones con isActive = false
 */
router.get("/inactive", locationController.listInactive);

/**
 * @swagger
 * /api/locations/deleted:
 *   get:
 *     summary: Listar las localizaciones borradas (papelera)
 *     tags: [Localizaciones]
 *     responses:
 *       200:
 *         description: Localizaciones con deletedAt distinto de null
 */
router.get("/deleted", locationController.listDeleted);

/**
 * @swagger
 * /api/locations/slug/{slug}:
 *   get:
 *     summary: Obtener una localización por su slug
 *     tags: [Localizaciones]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Localización encontrada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/slug/:slug", validate(slugParamsSchema, "params"), locationController.getBySlug);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Obtener una localización por id
 *     tags: [Localizaciones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Localización encontrada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Editar una localización (solo los campos enviados)
 *     tags: [Localizaciones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LocationInput' }
 *     responses:
 *       200:
 *         description: Localización actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una localización (soft delete)
 *     tags: [Localizaciones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Localización eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(uuidParamsSchema, "params"), locationController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(locationSchemas.update), locationController.update);
router.delete("/:id", validate(uuidParamsSchema, "params"), locationController.remove);

/**
 * @swagger
 * /api/locations/{id}/status:
 *   patch:
 *     summary: Cambiar el estado de una localización (active o inactive)
 *     tags: [Localizaciones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch("/:id/status", validate(uuidParamsSchema, "params"), validate(locationStatusSchema), locationController.setStatus);

/**
 * @swagger
 * /api/locations/{id}/activate:
 *   patch:
 *     summary: Activar una localización
 *     tags: [Localizaciones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Localización activada
 */
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), locationController.activate);

/**
 * @swagger
 * /api/locations/{id}/deactivate:
 *   patch:
 *     summary: Desactivar una localización
 *     tags: [Localizaciones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Localización desactivada
 */
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), locationController.deactivate);

/**
 * @swagger
 * /api/locations/{id}/restore:
 *   patch:
 *     summary: Restaurar una localización de la papelera
 *     tags: [Localizaciones]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Localización restaurada
 */
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), locationController.restore);

export default router;
