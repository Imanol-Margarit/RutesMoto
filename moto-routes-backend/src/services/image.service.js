import { imageRepository } from "../repositories/image.repository.js";
import { routeRepository } from "../repositories/route.repository.js";
import { AppError } from "../utils/app-error.js";

async function ensureRoute(routeId) {
  const route = await routeRepository.findById(routeId);
  if (!route) throw new AppError("Ruta no encontrada", 404);
}

const imageNotFound = () => new AppError("Imagen no encontrada", 404);

export const imageService = {
  async list(routeId) {
    await ensureRoute(routeId);
    return imageRepository.findByRoute(routeId);
  },

  async add(routeId, payload) {
    await ensureRoute(routeId);
    return imageRepository.create(routeId, payload);
  },

  async update(routeId, imageId, payload) {
    await ensureRoute(routeId);
    const current = await imageRepository.findById(routeId, imageId);
    if (!current) throw imageNotFound();

    const updated = await imageRepository.update(routeId, imageId, payload);
    if (!updated) throw imageNotFound();
    return updated;
  },

  async remove(routeId, imageId) {
    await ensureRoute(routeId);
    const removed = await imageRepository.remove(routeId, imageId);
    if (!removed) throw imageNotFound();
  }
};
