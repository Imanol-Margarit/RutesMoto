import { routeService } from "../services/route.service.js";

function respond(res, status, message, data) {
  return res.status(status).json({ success: true, message, data });
}

export const routeController = {
  async list(_req, res, next) {
    try { return respond(res, 200, "Rutas obtenidas correctamente", await routeService.list()); }
    catch (error) { return next(error); }
  },
  async listActive(_req, res, next) {
    try { return respond(res, 200, "Rutas activas obtenidas correctamente", await routeService.listActive()); }
    catch (error) { return next(error); }
  },
  async listInactive(_req, res, next) {
    try { return respond(res, 200, "Rutas inactivas obtenidas correctamente", await routeService.listInactive()); }
    catch (error) { return next(error); }
  },
  async listDeleted(_req, res, next) {
    try { return respond(res, 200, "Rutas eliminadas obtenidas correctamente", await routeService.listDeleted()); }
    catch (error) { return next(error); }
  },
  async getById(req, res, next) {
    try { return respond(res, 200, "Ruta obtenida correctamente", await routeService.getById(req.params.id)); }
    catch (error) { return next(error); }
  },
  async getBySlug(req, res, next) {
    try { return respond(res, 200, "Ruta obtenida correctamente", await routeService.getBySlug(req.params.slug)); }
    catch (error) { return next(error); }
  },
  async create(req, res, next) {
    try { return respond(res, 201, "Ruta creada correctamente", await routeService.create(req.body)); }
    catch (error) { return next(error); }
  },
  async update(req, res, next) {
    try { return respond(res, 200, "Ruta actualizada correctamente", await routeService.update(req.params.id, req.body)); }
    catch (error) { return next(error); }
  },
  async activate(req, res, next) {
    try { return respond(res, 200, "Ruta activada correctamente", await routeService.activate(req.params.id)); }
    catch (error) { return next(error); }
  },
  async deactivate(req, res, next) {
    try { return respond(res, 200, "Ruta desactivada correctamente", await routeService.deactivate(req.params.id)); }
    catch (error) { return next(error); }
  },
  async setStatus(req, res, next) {
    try { return respond(res, 200, "Estado de la ruta actualizado correctamente", await routeService.setStatus(req.params.id, req.body.status)); }
    catch (error) { return next(error); }
  },
  async remove(req, res, next) {
    try { return respond(res, 200, "Ruta eliminada correctamente", await routeService.remove(req.params.id)); }
    catch (error) { return next(error); }
  },
  async restore(req, res, next) {
    try { return respond(res, 200, "Ruta restaurada correctamente", await routeService.restore(req.params.id)); }
    catch (error) { return next(error); }
  }
};
