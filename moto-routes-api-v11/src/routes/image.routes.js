import { Router } from "express";
import { imageController } from "../controllers/image.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { imageParamsSchema } from "../schemas/common.schema.js";
import { imageSchemas } from "../schemas/image.schema.js";

// mergeParams: el :id viene de la ruta de la que cuelgan las imágenes.
const router = Router({ mergeParams: true });

router.get("/", imageController.list);
router.post("/", validate(imageSchemas.create), imageController.add);
router.patch("/:imageId", validate(imageParamsSchema, "params"), validate(imageSchemas.update), imageController.update);
router.delete("/:imageId", validate(imageParamsSchema, "params"), imageController.remove);

export default router;
