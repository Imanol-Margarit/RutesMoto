import { shopService } from "../services/shop.service.js";
import { shopRouteQuerySchema } from "../schemas/shop.schema.js";
import { AppError } from "../utils/app-error.js";
import { respond } from "../utils/response.util.js";

export const shopController = {
  async categories(req, res, next) {
    try {
      return respond(res, 200, "Categorías obtenidas", await shopService.getCategories());
    } catch (error) {
      return next(error);
    }
  },

  async hosts(req, res, next) {
    try {
      return respond(res, 200, "Guías obtenidos", await shopService.getHosts());
    } catch (error) {
      return next(error);
    }
  },

  async locations(req, res, next) {
    try {
      return respond(res, 200, "Localizaciones obtenidas", await shopService.getLocations());
    } catch (error) {
      return next(error);
    }
  },

  async routes(req, res, next) {
    try {
      const parsed = shopRouteQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const message = parsed.error.issues.map((issue) => issue.message).join(" · ");
        throw new AppError(message, 400);
      }
      return respond(res, 200, "Rutas obtenidas", await shopService.getRoutes(parsed.data));
    } catch (error) {
      return next(error);
    }
  },

  async routeDepartures(req, res, next) {
    try {
      return respond(res, 200, "Salidas obtenidas", await shopService.getRouteDepartures(req.params.slug));
    } catch (error) {
      return next(error);
    }
  },

  async routeDetail(req, res, next) {
    try {
      return respond(res, 200, "Ruta obtenida", await shopService.getRouteDetail(req.params.slug));
    } catch (error) {
      return next(error);
    }
  },
};
