import { imageService } from "../services/image.service.js";
import { respond } from "../utils/response.util.js";

// Cada función recibe el tipo de entidad ("route", "host", "category", "location", "user")
// y devuelve el handler de Express para esa entidad.
export const imageController = {
  list(kind) {
    return async (req, res, next) => {
      try {
        const data = await imageService.list(kind, req.params.id);
        return respond(res, 200, "Listado de imágenes obtenido correctamente", data);
      } catch (error) {
        return next(error);
      }
    };
  },

  add(kind) {
    return async (req, res, next) => {
      try {
        const data = await imageService.add(kind, req.params.id, req.body);
        return respond(res, 201, "Imagen añadida correctamente", data);
      } catch (error) {
        return next(error);
      }
    };
  },

  update(kind) {
    return async (req, res, next) => {
      try {
        const data = await imageService.update(kind, req.params.id, req.params.imageId, req.body);
        return respond(res, 200, "Imagen actualizada correctamente", data);
      } catch (error) {
        return next(error);
      }
    };
  },

  remove(kind) {
    return async (req, res, next) => {
      try {
        await imageService.remove(kind, req.params.id, req.params.imageId);
        return respond(res, 200, "Imagen eliminada correctamente", null);
      } catch (error) {
        return next(error);
      }
    };
  }
};
