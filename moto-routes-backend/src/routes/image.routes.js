import { Router } from "express";
import { imageController } from "../controllers/image.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { imageParamsSchema } from "../schemas/common.schema.js";
import { imageSchemas } from "../schemas/image.schema.js";
import { authenticate } from "../middlewares/authentication.middleware.js";
import { requireWriter } from "../middlewares/authorization.middleware.js";

/**
 * Router de imágenes de una entidad. Se monta en /api/<entidad>/:id/images.
 * mergeParams: el :id viene de la ruta de la entidad dueña de las imágenes.
 */
export function createImageRoutes(kind) {
  const router = Router({ mergeParams: true });

  router.get("/", imageController.list(kind));
  router.post("/", authenticate, requireWriter, validate(imageSchemas.create), imageController.add(kind));
  router.patch(
    "/:imageId", 
    authenticate,
    requireWriter,
    validate(imageParamsSchema, "params"),
    validate(imageSchemas.update),
    imageController.update(kind)
  );
  router.delete("/:imageId", authenticate, requireWriter, validate(imageParamsSchema, "params"), imageController.remove(kind));

  return router;
}
