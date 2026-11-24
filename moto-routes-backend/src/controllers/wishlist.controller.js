import { wishlistService } from "../services/wishlist.service.js";
import { respond } from "../utils/response.util.js";

// El usuario siempre sale de la sesión (req.user), nunca de la URL ni del body.
export const wishlistController = {
  async list(req, res, next) {
    try {
      const data = await wishlistService.list(req.user.id);
      return respond(res, 200, "Lista de deseos obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async add(req, res, next) {
    try {
      const { created, ...data } = await wishlistService.add(req.user.id, req.params.slug);
      return created
        ? respond(res, 201, "Ruta añadida a tu lista de deseos", data)
        : respond(res, 200, "La ruta ya estaba en tu lista de deseos", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await wishlistService.remove(req.user.id, req.params.slug);
      return respond(res, 200, "Ruta quitada de tu lista de deseos", data);
    } catch (error) {
      return next(error);
    }
  }
};
