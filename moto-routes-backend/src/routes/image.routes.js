import { Router } from "express";
import { imageController } from "../controllers/image.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { imageParamsSchema } from "../schemas/common.schema.js";
import { imageSchemas } from "../schemas/image.schema.js";

/**
 * Router de imágenes de una entidad. Se monta en /api/<entidad>/:id/images.
 * mergeParams: el :id viene de la ruta de la entidad dueña de las imágenes.
 */
export function createImageRoutes(kind) {
  const router = Router({ mergeParams: true });

  router.get("/", imageController.list(kind));
  router.post("/", validate(imageSchemas.create), imageController.add(kind));
  router.patch(
    "/:imageId",
    validate(imageParamsSchema, "params"),
    validate(imageSchemas.update),
    imageController.update(kind)
  );
  router.delete("/:imageId", validate(imageParamsSchema, "params"), imageController.remove(kind));

  return router;
}
