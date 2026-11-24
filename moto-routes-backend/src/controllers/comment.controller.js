import { commentService } from "../services/comment.service.js";
import { respond } from "../utils/response.util.js";

export const commentController = {
  async listByRoute(req, res, next) {
    try {
      const data = await commentService.listByRoute(req.params.slug);
      return respond(res, 200, "Comentarios obtenidos correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await commentService.create(req.params.slug, req.user, req.body);
      return respond(res, 201, "Comentario publicado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await commentService.update(req.params.id, req.user, req.body);
      return respond(res, 200, "Comentario actualizado correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await commentService.remove(req.params.id, req.user);
      return respond(res, 200, "Comentario eliminado correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
