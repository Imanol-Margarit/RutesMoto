import { hostRepository } from "../repositories/host.repository.js";
import { AppError } from "../utils/app-error.js";
import { generateSlug } from "../utils/slug.util.js";

// Slug único a partir del nombre. Si ya existe, añade -2, -3...
async function uniqueSlug(name, excludeId = null) {
  const root = generateSlug(name) || "guia";
  let candidate = root;
  let suffix = 2;
  while (await hostRepository.slugExists(candidate, excludeId)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

const notFound = () => new AppError("Guía no encontrada", 404);

export const hostService = {
  async list() {
    return hostRepository.findAll();
  },

  async listActive() {
    return hostRepository.findAll({ isActive: true });
  },

  async listInactive() {
    return hostRepository.findAll({ isActive: false });
  },

  async listDeleted() {
    return hostRepository.findDeleted();
  },

  async getById(id) {
    const host = await hostRepository.findById(id);
    if (!host) throw notFound();
    return host;
  },

  async getBySlug(slug) {
    const host = await hostRepository.findBySlug(slug);
    if (!host) throw notFound();
    return host;
  },

  async create(payload) {
    const slug = await uniqueSlug(payload.name);
    return hostRepository.create({ ...payload, slug });
  },

  async update(id, payload) {
    // 1. Validar el id
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    // 2. Buscar el guía
    const current = await hostRepository.findById(id);
    if (!current) throw notFound();

    // 3. Preparar los datos: el slug solo cambia si cambia el nombre
    const data = { ...payload };
    if (payload.name !== undefined) {
      data.slug = await uniqueSlug(payload.name, id);
    }

    // 4. Guardar
    const updated = await hostRepository.update(id, data);
    if (!updated) throw notFound();
    return updated;
  },

  async setActive(id, isActive) {
    const updated = await hostRepository.update(id, { isActive });
    if (!updated) throw notFound();
    return updated;
  },

  async setStatus(id, status) {
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }
    const updated = await hostRepository.update(id, { status });
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    const removed = await hostRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  },

  async restore(id) {
    const restored = await hostRepository.restore(id);
    if (!restored) throw new AppError("Guía eliminada no encontrada", 404);
    return restored;
  }
};
