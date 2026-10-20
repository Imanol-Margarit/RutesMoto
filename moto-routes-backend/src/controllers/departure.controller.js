import { departureService } from "../services/departure.service.js";
import { respond } from "../utils/response.util.js";

export const departureController = {
  async list(_req, res, next) {
    try {
      const data = await departureService.list();
      return respond(res, 200, "Listado de salidas obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async listActive(_req, res, next) {
    try {
      const data = await departureService.listActive();
      return respond(res, 200, "Solo las salidas activas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listInactive(_req, res, next) {
    try {
      const data = await departureService.listInactive();
      return respond(res, 200, "Solo las salidas inactivas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listDeleted(_req, res, next) {
    try {
      const data = await departureService.listDeleted();
      return respond(res, 200, "Listado de salidas eliminadas", data);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await departureService.getById(req.params.id);
      return respond(res, 200, "Salida obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await departureService.getBySlug(req.params.slug);
      return respond(res, 200, "Salida obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await departureService.create(req.body);
      return respond(res, 201, "Salida creada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await departureService.update(req.params.id, req.body);
      return respond(res, 200, "Salida actualizada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async activate(req, res, next) {
    try {
      const data = await departureService.setActive(req.params.id, true);
      return respond(res, 200, "Salida activada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async setStatus(req, res, next) {
    try {
      const data = await departureService.setStatus(req.params.id, req.body.status);
      return respond(res, 200, "Estado de la salida actualizado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async deactivate(req, res, next) {
    try {
      const data = await departureService.setActive(req.params.id, false);
      return respond(res, 200, "Salida desactivada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async restore(req, res, next) {
    try {
      const data = await departureService.restore(req.params.id);
      return respond(res, 200, "Salida restaurada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await departureService.remove(req.params.id);
      return respond(res, 200, "Salida eliminada correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
