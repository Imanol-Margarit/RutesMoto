import { routeRepository } from "../repositories/route.repository.js";
import { AppError } from "../utils/app-error.js";
import { generateSlug } from "../utils/slug.util.js";

async function generateUniqueSlug(title, excludeId = null) {
  const baseSlug = generateSlug(title) || "ruta";
  let candidate = baseSlug;
  let suffix = 2;

  while (await routeRepository.slugExists(candidate, excludeId)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export const routeService = {
  /** Todas las rutas no borradas (activas + inactivas). */
  async list() {
    return routeRepository.findAll();
  },

  /** Solo rutas con isActive = true. */
  async listActive() {
    return routeRepository.findAll({ isActive: true });
  },

  /** Solo rutas con isActive = false. */
  async listInactive() {
    return routeRepository.findAll({ isActive: false });
  },

  /** Solo rutas con soft delete (para poder recuperarlas con restore). */
  async listDeleted() {
    return routeRepository.findDeleted();
  },

  async getById(id) {
    const route = await routeRepository.findById(id);
    if (!route) throw new AppError("Ruta no encontrada", 404);
    return route;
  },

  async getBySlug(slug) {
    const route = await routeRepository.findBySlug(slug);
    if (!route) throw new AppError("Ruta no encontrada", 404);
    return route;
  },

  async create(payload) {
    const slug = await generateUniqueSlug(payload.title);
    return routeRepository.create({
      ...payload,
      slug,
      status: payload.status ?? "publicada",
      isActive: payload.isActive ?? true
    });
  },

  async update(id, data) {
    const payload = { ...data };

    // Si cambia el título, el slug se regenera (excluyendo la propia ruta
    // para que no choque consigo misma).
    if (payload.title !== undefined) {
      payload.slug = await generateUniqueSlug(payload.title, id);
    }

    const updated = await routeRepository.updateById(id, payload);
    if (!updated) throw new AppError("Ruta no encontrada", 404);
    return updated;
  },

  /** Pone isActive = true. Es idempotente: si ya estaba activa, devuelve la ruta igual. */
  async activate(id) {
    const route = await routeRepository.setActiveById(id, true);
    if (!route) throw new AppError("Ruta no encontrada", 404);
    return route;
  },

  /** Pone isActive = false. Es idempotente. */
  async deactivate(id) {
    const route = await routeRepository.setActiveById(id, false);
    if (!route) throw new AppError("Ruta no encontrada", 404);
    return route;
  },

  /** Cambia solo el status (borrador | publicada | archivada). */
  async setStatus(id, status) {
    const route = await routeRepository.updateById(id, { status });
    if (!route) throw new AppError("Ruta no encontrada", 404);
    return route;
  },

  async remove(id) {
    const deleted = await routeRepository.softDeleteById(id);
    if (!deleted) throw new AppError("Ruta no encontrada", 404);
    return deleted;
  },

  async restore(id) {
    const restored = await routeRepository.restoreById(id);
    if (!restored) throw new AppError("Ruta eliminada no encontrada", 404);
    return restored;
  }
};
