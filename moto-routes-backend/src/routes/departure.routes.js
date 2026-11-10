import { Router } from "express";
import { departureController } from "../controllers/departure.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { departureSkuParamsSchema } from "../schemas/departure.schema.js";
import { departureSchemas, departureStatusSchema } from "../schemas/departure.schema.js";
import { authenticate } from "../middlewares/authentication.middleware.js";
import { requireWriter } from "../middlewares/authorization.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/departures:
 *   get:
 *     summary: Listar las salidas no borradas
 *     tags: [Salidas]
 *     responses:
 *       200:
 *         description: Listado de salidas ordenado por fecha de inicio
 *   post:
 *     summary: Crear una salida para una ruta
 *     description: El slug se genera a partir del slug de la ruta y la fecha de inicio.
 *     tags: [Salidas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/DepartureInput' }
 *     responses:
 *       201:
 *         description: Salida creada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", authenticate, requireWriter, departureController.list);
router.post("/", authenticate, requireWriter, validate(departureSchemas.create), departureController.create);

/**
 * @swagger
 * /api/departures/active:
 *   get:
 *     summary: Listar solo las salidas activas
 *     tags: [Salidas]
 *     responses:
 *       200:
 *         description: Salidas con isActive = true
 */
router.get("/active", authenticate, requireWriter, departureController.listActive);

/**
 * @swagger
 * /api/departures/inactive:
 *   get:
 *     summary: Listar solo las salidas inactivas
 *     tags: [Salidas]
 *     responses:
 *       200:
 *         description: Salidas con isActive = false
 */
router.get("/inactive", authenticate, requireWriter, departureController.listInactive);

/**
 * @swagger
 * /api/departures/deleted:
 *   get:
 *     summary: Listar las salidas borradas (papelera)
 *     tags: [Salidas]
 *     responses:
 *       200:
 *         description: Salidas con deletedAt distinto de null
 */
router.get("/deleted", authenticate, requireWriter, departureController.listDeleted);

/**
 * @swagger
 * /api/departures/slug/{slug}:
 *   get:
 *     summary: Obtener una salida por su slug
 *     tags: [Salidas]
 *     parameters:
 *       - $ref: '#/components/parameters/Slug'
 *     responses:
 *       200:
 *         description: Salida encontrada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/slug/:slug", authenticate, requireWriter, validate(slugParamsSchema, "params"), departureController.getBySlug);
router.get("/sku/:sku", authenticate, requireWriter, validate(departureSkuParamsSchema, "params"), departureController.getBySku);

/**
 * @swagger
 * /api/departures/{id}:
 *   get:
 *     summary: Obtener una salida por id
 *     tags: [Salidas]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartureId'
 *     responses:
 *       200:
 *         description: Salida encontrada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Editar una salida (solo los campos enviados)
 *     tags: [Salidas]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartureId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/DepartureInput' }
 *     responses:
 *       200:
 *         description: Salida actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una salida (soft delete)
 *     tags: [Salidas]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartureId'
 *     responses:
 *       200:
 *         description: Salida eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", authenticate, requireWriter, validate(uuidParamsSchema, "params"), departureController.getById);
router.patch("/:id", authenticate, requireWriter, validate(uuidParamsSchema, "params"), validate(departureSchemas.update), departureController.update);
router.patch("/:id/status", authenticate, requireWriter, validate(uuidParamsSchema, "params"), validate(departureStatusSchema), departureController.setStatus);

router.delete("/:id", authenticate, requireWriter, validate(uuidParamsSchema, "params"), departureController.remove);

/**
 * @swagger
 * /api/departures/{id}/activate:
 *   patch:
 *     summary: Activar una salida
 *     tags: [Salidas]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartureId'
 *     responses:
 *       200:
 *         description: Salida activada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/activate", authenticate, requireWriter, validate(uuidParamsSchema, "params"), departureController.activate);

/**
 * @swagger
 * /api/departures/{id}/deactivate:
 *   patch:
 *     summary: Desactivar una salida
 *     tags: [Salidas]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartureId'
 *     responses:
 *       200:
 *         description: Salida desactivada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/deactivate", authenticate, requireWriter, validate(uuidParamsSchema, "params"), departureController.deactivate);

/**
 * @swagger
 * /api/departures/{id}/restore:
 *   patch:
 *     summary: Restaurar una salida de la papelera
 *     tags: [Salidas]
 *     parameters:
 *       - $ref: '#/components/parameters/DepartureId'
 *     responses:
 *       200:
 *         description: Salida restaurada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/restore", authenticate, requireWriter, validate(uuidParamsSchema, "params"), departureController.restore);

export default router;
