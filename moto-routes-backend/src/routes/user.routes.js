import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { uuidParamsSchema } from "../schemas/common.schema.js";
import { userSchemas } from "../schemas/user.schema.js";

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar los usuarios no borrados
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Listado de usuarios (sin contraseña)
 *   post:
 *     summary: Crear un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserCreate' }
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", userController.list);
router.post("/", validate(userSchemas.create), userController.create);

/**
 * @swagger
 * /api/users/active:
 *   get:
 *     summary: Listar solo los usuarios activos
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Usuarios con isActive = true
 */
router.get("/active", userController.listActive);

/**
 * @swagger
 * /api/users/inactive:
 *   get:
 *     summary: Listar solo los usuarios inactivos
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Usuarios con isActive = false
 */
router.get("/inactive", userController.listInactive);

/**
 * @swagger
 * /api/users/deleted:
 *   get:
 *     summary: Listar los usuarios borrados (papelera)
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Usuarios con deletedAt distinto de null
 */
router.get("/deleted", userController.listDeleted);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por id
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Editar un usuario (solo los campos enviados; la contraseña es opcional)
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserUpdate' }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar un usuario (soft delete)
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(uuidParamsSchema, "params"), userController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(userSchemas.update), userController.update);
router.delete("/:id", validate(uuidParamsSchema, "params"), userController.remove);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Activar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuario activado
 */
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), userController.activate);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Desactivar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuario desactivado
 */
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), userController.deactivate);

/**
 * @swagger
 * /api/users/{id}/restore:
 *   patch:
 *     summary: Restaurar un usuario de la papelera
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuario restaurado
 */
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), userController.restore);

export default router;
