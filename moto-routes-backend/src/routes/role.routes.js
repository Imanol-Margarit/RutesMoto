import { Router } from "express";
import { roleController } from "../controllers/role.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { roleSchemas } from "../schemas/role.schema.js";

const router = Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Listar las roles no borradas
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Listado de roles
 *   post:
 *     summary: Crear una rol
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RoleInput' }
 *     responses:
 *       201:
 *         description: Rol creado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", roleController.list);
router.post("/", validate(roleSchemas.create), roleController.create);

/**
 * @swagger
 * /api/roles/active:
 *   get:
 *     summary: Listar solo las roles activas
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles con isActive = true
 */
router.get("/active", roleController.listActive);

/**
 * @swagger
 * /api/roles/inactive:
 *   get:
 *     summary: Listar solo las roles inactivas
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles con isActive = false
 */
router.get("/inactive", roleController.listInactive);

/**
 * @swagger
 * /api/roles/deleted:
 *   get:
 *     summary: Listar las roles borradas (papelera)
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles con deletedAt distinto de null
 */
router.get("/deleted", roleController.listDeleted);

/**
 * @swagger
 * /api/roles/slug/{slug}:
 *   get:
 *     summary: Obtener una rol por su slug
 *     tags: [Roles]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rol encontrada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/slug/:slug", validate(slugParamsSchema, "params"), roleController.getBySlug);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener una rol por id
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Rol encontrada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Editar una rol (solo los campos enviados)
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RoleInput' }
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una rol (soft delete)
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Rol eliminado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(uuidParamsSchema, "params"), roleController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(roleSchemas.update), roleController.update);
router.delete("/:id", validate(uuidParamsSchema, "params"), roleController.remove);

/**
 * @swagger
 * /api/roles/{id}/activate:
 *   patch:
 *     summary: Activar una rol
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Rol activado
 */
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), roleController.activate);

/**
 * @swagger
 * /api/roles/{id}/deactivate:
 *   patch:
 *     summary: Desactivar una rol
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Rol desactivado
 */
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), roleController.deactivate);

/**
 * @swagger
 * /api/roles/{id}/restore:
 *   patch:
 *     summary: Restaurar una rol de la papelera
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Rol restaurado
 */
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), roleController.restore);

export default router;
