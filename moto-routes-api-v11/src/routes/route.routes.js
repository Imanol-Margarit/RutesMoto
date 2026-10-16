import { Router } from "express";
import { routeController } from "../controllers/route.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { routeSchemas, routeStatusSchema } from "../schemas/route.schema.js";
import imageRoutes from "./image.routes.js";

const router = Router();

// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", routeController.list);
router.get("/active", routeController.listActive);
router.get("/inactive", routeController.listInactive);
router.get("/deleted", routeController.listDeleted);
router.get("/slug/:slug", validate(slugParamsSchema, "params"), routeController.getBySlug);

router.post("/", validate(routeSchemas.create), routeController.create);
router.get("/:id", validate(uuidParamsSchema, "params"), routeController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(routeSchemas.update), routeController.update);
router.patch("/:id/status", validate(uuidParamsSchema, "params"), validate(routeStatusSchema), routeController.setStatus);
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), routeController.activate);
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), routeController.deactivate);
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), routeController.restore);
router.delete("/:id", validate(uuidParamsSchema, "params"), routeController.remove);

router.use("/:id/images", validate(uuidParamsSchema, "params"), imageRoutes);

export default router;
