import { userService } from "../services/user.service.js";
import { respond } from "../utils/response.util.js";

export const userController = {
  async list(_req, res, next) {
    try {
      const data = await userService.list();
      return respond(res, 200, "Listado de usuarios obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async listActive(_req, res, next) {
    try {
      const data = await userService.listActive();
      return respond(res, 200, "Solo los usuarios activos", data);
    } catch (error) {
      return next(error);
    }
  },

  async listInactive(_req, res, next) {
    try {
      const data = await userService.listInactive();
      return respond(res, 200, "Solo los usuarios inactivos", data);
    } catch (error) {
      return next(error);
    }
  },

  async listDeleted(_req, res, next) {
    try {
      const data = await userService.listDeleted();
      return respond(res, 200, "Listado de usuarios eliminados", data);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await userService.getById(req.params.id);
      return respond(res, 200, "Usuario obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await userService.create(req.body);
      return respond(res, 201, "Usuario creado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await userService.update(req.params.id, req.body);
      return respond(res, 200, "Usuario actualizado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async activate(req, res, next) {
    try {
      const data = await userService.setActive(req.params.id, true);
      return respond(res, 200, "Usuario activado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async deactivate(req, res, next) {
    try {
      const data = await userService.setActive(req.params.id, false);
      return respond(res, 200, "Usuario desactivado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async restore(req, res, next) {
    try {
      const data = await userService.restore(req.params.id);
      return respond(res, 200, "Usuario restaurado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await userService.remove(req.params.id);
      return respond(res, 200, "Usuario eliminado correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
