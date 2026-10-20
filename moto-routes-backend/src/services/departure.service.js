import { departureRepository } from "../repositories/departure.repository.js";
import { routeRepository } from "../repositories/route.repository.js";
import { AppError } from "../utils/app-error.js";
import { generateSlug } from "../utils/slug.util.js";

// Slug de la salida: "<slug-de-la-ruta> <fecha>". Si ya existe, añade -2, -3...
async function buildSlug(routeId, startDatetime, excludeId = null) {
  const route = await routeRepository.findById(routeId);
  if (!route) throw new AppError("La ruta indicada no existe", 400);

  const date = new Date(startDatetime).toISOString().slice(0, 10);
  const root = generateSlug(`${route.slug} ${date}`) || "salida";
  let candidate = root;
  let suffix = 2;
  while (await departureRepository.slugExists(candidate, excludeId)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

const notFound = () => new AppError("Salida no encontrada", 404);

export const departureService = {
  async list() {
    return departureRepository.findAll();
  },

  async listActive() {
    return departureRepository.findAll({ isActive: true });
  },

  async listInactive() {
    return departureRepository.findAll({ isActive: false });
  },

  async listDeleted() {
    return departureRepository.findDeleted();
  },

  async getById(id) {
    const departure = await departureRepository.findById(id);
    if (!departure) throw notFound();
    return departure;
  },

  async getBySlug(slug) {
    const departure = await departureRepository.findBySlug(slug);
    if (!departure) throw notFound();
    return departure;
  },

  async create(payload) {
    const slug = await buildSlug(payload.routeId, payload.startDatetime);
    return departureRepository.create({ ...payload, slug });
  },

  async update(id, payload) {
    // 1. Validar el id
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    const current = await departureRepository.findById(id);
    if (!current) throw notFound();

    const merged = { ...current, ...payload };

    if (new Date(merged.endDatetime) <= new Date(merged.startDatetime)) {
      throw new AppError("La fecha de fin debe ser posterior a la de inicio", 400);
    }

    if (merged.bookedParticipants > merged.capacity) {
      throw new AppError("Las plazas reservadas no pueden superar la capacidad", 400);
    }

    const data = { ...payload };
    // El slug depende de la ruta y de la fecha: se recalcula si cambia alguna.
    if (payload.routeId !== undefined || payload.startDatetime !== undefined) {
      data.slug = await buildSlug(
        payload.routeId ?? current.routeId,
        payload.startDatetime ?? current.startDatetime,
        id
      );
    }

    const updated = await departureRepository.update(id, data);
    if (!updated) throw notFound();
    return updated;
  },

  async setActive(id, isActive) {
    const updated = await departureRepository.update(id, { isActive });
    if (!updated) throw notFound();
    return updated;
  },
  
    async setStatus(id, status) {
    // 1. Validar el id
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    // 2. Guardar el nuevo estado
    const updated = await departureRepository.update(id, { status });
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    const removed = await departureRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  },

  async restore(id) {
    const restored = await departureRepository.restore(id);
    if (!restored) throw new AppError("Salida eliminada no encontrada", 404);
    return restored;
  }
};
