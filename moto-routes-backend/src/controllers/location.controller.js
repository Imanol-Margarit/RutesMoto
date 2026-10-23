import { locationService } from "../services/location.service.js";
import { respond } from "../utils/response.util.js";

export const locationController = {
  async list(_req, res, next) {
    try {
      const data = await locationService.list();
      return respond(res, 200, "Listado de localizaciones obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async listActive(_req, res, next) {
    try {
      const data = await locationService.listActive();
      return respond(res, 200, "Solo las localizaciones activas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listInactive(_req, res, next) {
    try {
      const data = await locationService.listInactive();
      return respond(res, 200, "Solo las localizaciones inactivas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listDeleted(_req, res, next) {
    try {
      const data = await locationService.listDeleted();
      return respond(res, 200, "Listado de localizaciones eliminadas", data);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await locationService.getById(req.params.id);
      return respond(res, 200, "Localización obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await locationService.getBySlug(req.params.slug);
      return respond(res, 200, "Localización obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await locationService.create(req.body);
      return respond(res, 201, "Localización creada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await locationService.update(req.params.id, req.body);
      return respond(res, 200, "Localización actualizada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async setStatus(req, res, next) {
    try {
      const data = await locationService.setStatus(req.params.id, req.body.status);
      return respond(res, 200, "Estado de la localización actualizado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async activate(req, res, next) {
    try {
      const data = await locationService.setActive(req.params.id, true);
      return respond(res, 200, "Localización activada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async deactivate(req, res, next) {
    try {
      const data = await locationService.setActive(req.params.id, false);
      return respond(res, 200, "Localización desactivada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async restore(req, res, next) {
    try {
      const data = await locationService.restore(req.params.id);
      return respond(res, 200, "Localización restaurada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await locationService.remove(req.params.id);
      return respond(res, 200, "Localización eliminada correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
