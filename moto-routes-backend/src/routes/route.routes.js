import { Router } from "express";
import { routeController } from "../controllers/route.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createRouteSchema, routeIdParamsSchema, routeSlugParamsSchema, updateRouteSchema, updateStatusSchema } from "../schemas/route.schema.js";

const router = Router();

// IMPORTANTE: las rutas fijas (/active, /inactive, /deleted, /slug/:slug) van ANTES de /:id,
// si no Express interpretaría "active" como un id y fallaría la validación del UUID.
router.get("/", routeController.list);
router.get("/active", routeController.listActive);
router.get("/inactive", routeController.listInactive);
router.get("/deleted", routeController.listDeleted);
router.get("/slug/:slug", validate(routeSlugParamsSchema, "params"), routeController.getBySlug);
router.get("/:id", validate(routeIdParamsSchema, "params"), routeController.getById);

router.post("/", validate(createRouteSchema), routeController.create);
router.patch("/:id", validate(routeIdParamsSchema, "params"), validate(updateRouteSchema), routeController.update);
router.patch("/:id/activate", validate(routeIdParamsSchema, "params"), routeController.activate);
router.patch("/:id/deactivate", validate(routeIdParamsSchema, "params"), routeController.deactivate);
router.patch("/:id/status", validate(routeIdParamsSchema, "params"), validate(updateStatusSchema), routeController.setStatus);
router.patch("/:id/restore", validate(routeIdParamsSchema, "params"), routeController.restore);
router.delete("/:id", validate(routeIdParamsSchema, "params"), routeController.remove);

export default router;
