import { categoryService } from "../services/category.service.js";
import { respond } from "../utils/response.util.js";

export const categoryController = {
  async list(_req, res, next) {
    try {
      const data = await categoryService.list();
      return respond(res, 200, "Listado de categorías obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async listActive(_req, res, next) {
    try {
      const data = await categoryService.listActive();
      return respond(res, 200, "Solo las categorías activas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listInactive(_req, res, next) {
    try {
      const data = await categoryService.listInactive();
      return respond(res, 200, "Solo las categorías inactivas", data);
    } catch (error) {
      return next(error);
    }
  },

  async listDeleted(_req, res, next) {
    try {
      const data = await categoryService.listDeleted();
      return respond(res, 200, "Listado de categorías eliminadas", data);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await categoryService.getById(req.params.id);
      return respond(res, 200, "Categoría obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await categoryService.getBySlug(req.params.slug);
      return respond(res, 200, "Categoría obtenida correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await categoryService.create(req.body);
      return respond(res, 201, "Categoría creada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await categoryService.update(req.params.id, req.body);
      return respond(res, 200, "Categoría actualizada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async activate(req, res, next) {
    try {
      const data = await categoryService.setActive(req.params.id, true);
      return respond(res, 200, "Categoría activada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async deactivate(req, res, next) {
    try {
      const data = await categoryService.setActive(req.params.id, false);
      return respond(res, 200, "Categoría desactivada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async restore(req, res, next) {
    try {
      const data = await categoryService.restore(req.params.id);
      return respond(res, 200, "Categoría restaurada correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await categoryService.remove(req.params.id);
      return respond(res, 200, "Categoría eliminada correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
