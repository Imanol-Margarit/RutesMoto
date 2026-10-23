import { imageModels } from "../models/image.model.js";
import { imageRepository } from "../repositories/image.repository.js";
import { routeRepository } from "../repositories/route.repository.js";
import { hostRepository } from "../repositories/host.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { locationRepository } from "../repositories/location.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";

const parentRepositories = {
  route: routeRepository,
  host: hostRepository,
  category: categoryRepository,
  location: locationRepository,
  user: userRepository
};

async function ensureParent(kind, parentId) {
  const parent = await parentRepositories[kind].findById(parentId);
  if (!parent) throw new AppError(imageModels[kind].notFound, 404);
}

async function ensureImage(kind, parentId, imageId) {
  const image = await imageRepository.findById(kind, parentId, imageId);
  if (!image) throw new AppError("Imagen no encontrada", 404);
}

export const imageService = {
  async list(kind, parentId) {
    await ensureParent(kind, parentId);
    return imageRepository.findByParent(kind, parentId);
  },

  async add(kind, parentId, payload) {
    await ensureParent(kind, parentId);
    return imageRepository.create(kind, parentId, payload);
  },

  async update(kind, parentId, imageId, payload) {
    await ensureParent(kind, parentId);
    await ensureImage(kind, parentId, imageId);
    return imageRepository.update(kind, parentId, imageId, payload);
  },

  async remove(kind, parentId, imageId) {
    await ensureParent(kind, parentId);
    await ensureImage(kind, parentId, imageId);
    await imageRepository.remove(kind, parentId, imageId);
  }
};
