import { locationRepository } from "../repositories/location.repository.js";
import { AppError } from "../utils/app-error.js";
import { generateSlug } from "../utils/slug.util.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Slug único a partir de ciudad y país. Si ya existe, añade -2, -3...
async function uniqueSlug(text, excludeId = null) {
  const root = generateSlug(text) || "localizacion";
  let candidate = root;
  let suffix = 2;
  while (await locationRepository.slugExists(candidate, excludeId)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

const notFound = () => new AppError("Localización no encontrada", 404);

export const locationService = {
  async list() {
    return locationRepository.findAll();
  },

  async listActive() {
    return locationRepository.findAll({ isActive: true });
  },

  async listInactive() {
    return locationRepository.findAll({ isActive: false });
  },

  async listDeleted() {
    return locationRepository.findDeleted();
  },

  async getById(id) {
    const location = await locationRepository.findById(id);
    if (!location) throw notFound();
    return location;
  },

  async getBySlug(slug) {
    const location = await locationRepository.findBySlug(slug);
    if (!location) throw notFound();
    return location;
  },

  async create(payload) {
    const slug = await uniqueSlug(`${payload.city} ${payload.country}`);
    return locationRepository.create({ ...payload, slug });
  },

  async update(id, payload) {
    // 1. Validar el id
    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    // 2. Buscar la localización
    const current = await locationRepository.findById(id);
    if (!current) throw notFound();

    // 3. Preparar los datos: el slug cambia si cambia la ciudad o el país
    const data = { ...payload };
    if (payload.city !== undefined || payload.country !== undefined) {
      const merged = { ...current, ...payload };
      data.slug = await uniqueSlug(`${merged.city} ${merged.country}`, id);
    }

    // 4. Guardar
    const updated = await locationRepository.update(id, data);
    if (!updated) throw notFound();
    return updated;
  },

  async setActive(id, isActive) {
    const updated = await locationRepository.update(id, { isActive });
    if (!updated) throw notFound();
    return updated;
  },

  async setStatus(id, status) {
    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }
    const updated = await locationRepository.update(id, { status });
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    const removed = await locationRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  },

  async restore(id) {
    const restored = await locationRepository.restore(id);
    if (!restored) throw new AppError("Localización eliminada no encontrada", 404);
    return restored;
  }
};
