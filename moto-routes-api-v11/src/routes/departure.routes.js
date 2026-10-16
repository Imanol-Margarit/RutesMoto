import { Router } from "express";
import { departureController } from "../controllers/departure.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { slugParamsSchema, uuidParamsSchema } from "../schemas/common.schema.js";
import { departureSchemas } from "../schemas/departure.schema.js";

const router = Router();

// Las rutas fijas van antes de "/:id": si no, Express tomaría "active" como id.
router.get("/", departureController.list);
router.get("/active", departureController.listActive);
router.get("/inactive", departureController.listInactive);
router.get("/deleted", departureController.listDeleted);
router.get("/slug/:slug", validate(slugParamsSchema, "params"), departureController.getBySlug);

router.post("/", validate(departureSchemas.create), departureController.create);
router.get("/:id", validate(uuidParamsSchema, "params"), departureController.getById);
router.patch("/:id", validate(uuidParamsSchema, "params"), validate(departureSchemas.update), departureController.update);
router.patch("/:id/activate", validate(uuidParamsSchema, "params"), departureController.activate);
router.patch("/:id/deactivate", validate(uuidParamsSchema, "params"), departureController.deactivate);
router.patch("/:id/restore", validate(uuidParamsSchema, "params"), departureController.restore);
router.delete("/:id", validate(uuidParamsSchema, "params"), departureController.remove);

export default router;
