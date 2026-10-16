import { Router } from "express";
import { departureController } from "../controllers/departure.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { departureSchemas } from "../schemas/departure.schema.js";

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
router.get("/", departureController.list);
router.post("/", validate(departureSchemas.create), departureController.create);

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
router.get("/active", departureController.listActive);

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
router.get("/inactive", departureController.listInactive);

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
router.get("/deleted", departureController.listDeleted);

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
router.get("/slug/:slug", validate(slugParamsSchema, "params"), departureController.getBySlug);

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
router.get("/:id", validate(uuidParamsSchema, "params"), departureController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(departureSchemas.update), departureController.update);
router.delete("/:id", validate(uuidParamsSchema, "params"), departureController.remove);

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
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), departureController.activate);

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
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), departureController.deactivate);

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
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), departureController.restore);

export default router;
