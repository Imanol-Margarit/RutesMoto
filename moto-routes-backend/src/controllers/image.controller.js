import { imageService } from "../services/image.service.js";
import { respond } from "../utils/response.util.js";

export const imageController = {
  async list(req, res, next) {
    try {
      const data = await imageService.list(req.params.id);
      return respond(res, 200, "Listado de imágenes obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async add(req, res, next) {
    try {
      const data = await imageService.add(req.params.id, req.body);
      return respond(res, 201, "Imagen añadida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await imageService.update(req.params.id, req.params.imageId, req.body);
      return respond(res, 200, "Imagen actualizada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await imageService.remove(req.params.id, req.params.imageId);
      return respond(res, 200, "Imagen eliminada correctamente", null);
    } catch (error) {
      return next(error);
    }
  }
};
