import { Router } from "express";
import { hostController } from "../controllers/host.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { hostSchemas, hostStatusSchema } from "../schemas/host.schema.js";

const router = Router();

/**
 * @swagger
 * /api/hosts:
 *   get:
 *     summary: Listar los guías no borrados
 *     tags: [Guías]
 *     responses:
 *       200:
 *         description: Listado de guías
 *   post:
 *     summary: Crear un guía
 *     tags: [Guías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/HostInput' }
 *     responses:
 *       201:
 *         description: Guía creado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", hostController.list);
router.post("/", validate(hostSchemas.create), hostController.create);

/**
 * @swagger
 * /api/hosts/active:
 *   get:
 *     summary: Listar solo los guías activos
 *     tags: [Guías]
 *     responses:
 *       200:
 *         description: Guías con isActive = true
 */
router.get("/active", hostController.listActive);

/**
 * @swagger
 * /api/hosts/inactive:
 *   get:
 *     summary: Listar solo los guías inactivos
 *     tags: [Guías]
 *     responses:
 *       200:
 *         description: Guías con isActive = false
 */
router.get("/inactive", hostController.listInactive);

/**
 * @swagger
 * /api/hosts/deleted:
 *   get:
 *     summary: Listar los guías borrados (papelera)
 *     tags: [Guías]
 *     responses:
 *       200:
 *         description: Guías con deletedAt distinto de null
 */
router.get("/deleted", hostController.listDeleted);

/**
 * @swagger
 * /api/hosts/slug/{slug}:
 *   get:
 *     summary: Obtener un guía por su slug
 *     tags: [Guías]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Guía encontrado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/slug/:slug", validate(slugParamsSchema, "params"), hostController.getBySlug);

/**
 * @swagger
 * /api/hosts/{id}:
 *   get:
 *     summary: Obtener un guía por id
 *     tags: [Guías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Guía encontrado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Editar un guía (solo los campos enviados)
 *     tags: [Guías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/HostInput' }
 *     responses:
 *       200:
 *         description: Guía actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar un guía (soft delete)
 *     tags: [Guías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Guía eliminado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(uuidParamsSchema, "params"), hostController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(hostSchemas.update), hostController.update);
router.delete("/:id", validate(uuidParamsSchema, "params"), hostController.remove);

/**
 * @swagger
 * /api/hosts/{id}/status:
 *   patch:
 *     summary: Cambiar el estado de un guía (active, inactive o suspended)
 *     tags: [Guías]
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
 *               status: { type: string, enum: [active, inactive, suspended] }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch("/:id/status", validate(uuidParamsSchema, "params"), validate(hostStatusSchema), hostController.setStatus);

/**
 * @swagger
 * /api/hosts/{id}/activate:
 *   patch:
 *     summary: Activar un guía
 *     tags: [Guías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Guía activado
 */
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), hostController.activate);

/**
 * @swagger
 * /api/hosts/{id}/deactivate:
 *   patch:
 *     summary: Desactivar un guía
 *     tags: [Guías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Guía desactivado
 */
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), hostController.deactivate);

/**
 * @swagger
 * /api/hosts/{id}/restore:
 *   patch:
 *     summary: Restaurar un guía de la papelera
 *     tags: [Guías]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Guía restaurado
 */
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), hostController.restore);

export default router;
