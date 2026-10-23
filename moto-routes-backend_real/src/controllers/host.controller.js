import { hostService } from "../services/host.service.js";
import { respond } from "../utils/response.util.js";

export const hostController = {
  async list(_req, res, next) {
    try {
      const data = await hostService.list();
      return respond(res, 200, "Listado de guías obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async listActive(_req, res, next) {
    try {
      const data = await hostService.listActive();
      return respond(res, 200, "Solo las guías activas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listInactive(_req, res, next) {
    try {
      const data = await hostService.listInactive();
      return respond(res, 200, "Solo las guías inactivas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listDeleted(_req, res, next) {
    try {
      const data = await hostService.listDeleted();
      return respond(res, 200, "Listado de guías eliminadas", data);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await hostService.getById(req.params.id);
      return respond(res, 200, "Guía obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await hostService.getBySlug(req.params.slug);
      return respond(res, 200, "Guía obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await hostService.create(req.body);
      return respond(res, 201, "Guía creada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await hostService.update(req.params.id, req.body);
      return respond(res, 200, "Guía actualizada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async setStatus(req, res, next) {
    try {
      const data = await hostService.setStatus(req.params.id, req.body.status);
      return respond(res, 200, "Estado del guía actualizado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async activate(req, res, next) {
    try {
      const data = await hostService.setActive(req.params.id, true);
      return respond(res, 200, "Guía activada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async deactivate(req, res, next) {
    try {
      const data = await hostService.setActive(req.params.id, false);
      return respond(res, 200, "Guía desactivada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async restore(req, res, next) {
    try {
      const data = await hostService.restore(req.params.id);
      return respond(res, 200, "Guía restaurada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await hostService.remove(req.params.id);
      return respond(res, 200, "Guía eliminada correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
