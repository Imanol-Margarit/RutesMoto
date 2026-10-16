import { routeRepository } from "../repositories/route.repository.js";
import { AppError } from "../utils/app-error.js";
import { generateSlug } from "../utils/slug.util.js";

// Slug único a partir del título. Si ya existe, añade -2, -3...
async function uniqueSlug(title, excludeId = null) {
  const root = generateSlug(title) || "ruta";
  let candidate = root;
  let suffix = 2;
  while (await routeRepository.slugExists(candidate, excludeId)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

const notFound = () => new AppError("Ruta no encontrada", 404);

export const routeService = {
  async list() {
    return routeRepository.findAll();
  },

  async listActive() {
    return routeRepository.findAll({ isActive: true });
  },

  async listInactive() {
    return routeRepository.findAll({ isActive: false });
  },

  async listDeleted() {
    return routeRepository.findDeleted();
  },

  async getById(id) {
    const route = await routeRepository.findById(id);
    if (!route) throw notFound();
    return route;
  },

  async getBySlug(slug) {
    const route = await routeRepository.findBySlug(slug);
    if (!route) throw notFound();
    return route;
  },

  async create(payload) {
    const slug = await uniqueSlug(payload.title);
    return routeRepository.create({ ...payload, slug });
  },

  async update(id, payload) {
    const data = { ...payload };
    // Solo cambia el slug si cambia el título.
    if (payload.title !== undefined) {
      data.slug = await uniqueSlug(payload.title, id);
    }
    const updated = await routeRepository.update(id, data);
    if (!updated) throw notFound();
    return updated;
  },

  async setActive(id, isActive) {
    const updated = await routeRepository.update(id, { isActive });
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    const removed = await routeRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  },

  async restore(id) {
    const restored = await routeRepository.restore(id);
    if (!restored) throw new AppError("Ruta eliminada no encontrada", 404);
    return restored;
  }
};
