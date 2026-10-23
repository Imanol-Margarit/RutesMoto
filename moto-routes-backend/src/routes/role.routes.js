import { Router } from "express";
import { roleController } from "../controllers/role.controller.js";

const router = Router();

/**
 * @swagger
 * /api/roles/active:
 *   get:
 *     summary: Listar los roles activos (admin, host, user)
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles con is_active = true
 */
router.get("/active", roleController.listActive);

export default router;
