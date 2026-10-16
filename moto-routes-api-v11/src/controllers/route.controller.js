import { routeService } from "../services/route.service.js";
import { respond } from "../utils/response.util.js";

export const routeController = {
  async list(_req, res, next) {
    try {
      const data = await routeService.list();
      return respond(res, 200, "Listado de rutas obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async listActive(_req, res, next) {
    try {
      const data = await routeService.listActive();
      return respond(res, 200, "Solo las rutas activas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listInactive(_req, res, next) {
    try {
      const data = await routeService.listInactive();
      return respond(res, 200, "Solo las rutas inactivas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listDeleted(_req, res, next) {
    try {
      const data = await routeService.listDeleted();
      return respond(res, 200, "Listado de rutas eliminadas", data);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await routeService.getById(req.params.id);
      return respond(res, 200, "Ruta obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await routeService.getBySlug(req.params.slug);
      return respond(res, 200, "Ruta obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await routeService.create(req.body);
      return respond(res, 201, "Ruta creada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await routeService.update(req.params.id, req.body);
      return respond(res, 200, "Ruta actualizada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async setStatus(req, res, next) {
    try {
      const data = await routeService.update(req.params.id, { status: req.body.status });
      return respond(res, 200, "Estado de la ruta actualizado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async activate(req, res, next) {
    try {
      const data = await routeService.setActive(req.params.id, true);
      return respond(res, 200, "Ruta activada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async deactivate(req, res, next) {
    try {
      const data = await routeService.setActive(req.params.id, false);
      return respond(res, 200, "Ruta desactivada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async restore(req, res, next) {
    try {
      const data = await routeService.restore(req.params.id);
      return respond(res, 200, "Ruta restaurada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await routeService.remove(req.params.id);
      return respond(res, 200, "Ruta eliminada correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
