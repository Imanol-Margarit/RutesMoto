import { routeRepository } from "../repositories/route.repository.js";
import { AppError } from "../utils/app-error.js";
import { generateSlug } from "../utils/slug.util.js";
import { hostRepository } from "../repositories/host.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { locationRepository } from "../repositories/location.repository.js";
import { departureRepository } from "../repositories/departure.repository.js";

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

async function validateRouteRefs(data) {
  if (data.hostId && !(await hostRepository.findById(data.hostId))) {
    throw new AppError("El guía indicado no existe o está borrado", 400);
  }
  if (data.categoryId && !(await categoryRepository.findById(data.categoryId))) {
    throw new AppError("La categoría indicada no existe o está borrada", 400);
  }
  if (data.locationId && !(await locationRepository.findById(data.locationId))) {
    throw new AppError("La localización indicada no existe o está borrada", 400);
  }
}

async function validateCanDeactivateRoute(routeId) {
  if (await departureRepository.hasOpenForRoute(routeId)) {
    throw new AppError("No puedes desactivar ni borrar una ruta con salidas que aún no han terminado", 409);
  }
}

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
    await validateRouteRefs(payload);
    const slug = await uniqueSlug(payload.title);
    return routeRepository.create({ ...payload, slug });
  },

  async update(id, payload) {
    await validateRouteRefs(payload);
    if (payload.isActive === false) await validateCanDeactivateRoute(id);
    //validateID
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }
    //findbyId
    const current = await routeRepository.findById(id);
    if (!current) throw notFound();
    
    //validar los atriburos necesarios
    const merged = { ...current, ...payload };
    if (merged.status === "publicada" && !merged.startPoint) {
      throw new AppError("Una ruta publicada necesita un punto de salida", 400);
    }

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
    if (!isActive) await validateCanDeactivateRoute(id);
    const updated = await routeRepository.update(id, { isActive });
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    await validateCanDeactivateRoute(id);
    const removed = await routeRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  },

  async restore(id) {
    const restored = await routeRepository.restore(id);
    if (!restored) throw new AppError("Ruta eliminada no encontrada", 404);
    return restored;
  },

  async setStatus(id, status) {
    // 1. Validar el id
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    // 2. Guardar el nuevo estado
    const updated = await routeRepository.update(id, { status });
    if (!updated) throw notFound();
    return updated;
  }
};
