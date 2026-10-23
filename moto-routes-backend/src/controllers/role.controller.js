import { roleService } from "../services/role.service.js";
import { respond } from "../utils/response.util.js";

export const roleController = {
  async list(_req, res, next) {
    try {
      const data = await roleService.list();
      return respond(res, 200, "Listado de roles obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async listActive(_req, res, next) {
    try {
      const data = await roleService.listActive();
      return respond(res, 200, "Solo los roles activos", data);
    } catch (error) {
      return next(error);
    }
  },

  async listInactive(_req, res, next) {
    try {
      const data = await roleService.listInactive();
      return respond(res, 200, "Solo los roles inactivos", data);
    } catch (error) {
      return next(error);
    }
  },

  async listDeleted(_req, res, next) {
    try {
      const data = await roleService.listDeleted();
      return respond(res, 200, "Listado de roles eliminados", data);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await roleService.getById(req.params.id);
      return respond(res, 200, "Rol obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await roleService.getBySlug(req.params.slug);
      return respond(res, 200, "Rol obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await roleService.create(req.body);
      return respond(res, 201, "Rol creado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await roleService.update(req.params.id, req.body);
      return respond(res, 200, "Rol actualizado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async activate(req, res, next) {
    try {
      const data = await roleService.setActive(req.params.id, true);
      return respond(res, 200, "Rol activado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async deactivate(req, res, next) {
    try {
      const data = await roleService.setActive(req.params.id, false);
      return respond(res, 200, "Rol desactivado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async restore(req, res, next) {
    try {
      const data = await roleService.restore(req.params.id);
      return respond(res, 200, "Rol restaurado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await roleService.remove(req.params.id);
      return respond(res, 200, "Rol eliminado correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
