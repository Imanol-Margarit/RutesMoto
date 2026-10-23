import { categoryRepository } from "../repositories/category.repository.js";
import { AppError } from "../utils/app-error.js";
import { generateSlug } from "../utils/slug.util.js";

// Slug único a partir del nombre. Si ya existe, añade -2, -3...
async function uniqueSlug(name, excludeId = null) {
  const root = generateSlug(name) || "categoria";
  let candidate = root;
  let suffix = 2;
  while (await categoryRepository.slugExists(candidate, excludeId)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

const notFound = () => new AppError("Categoría no encontrada", 404);

export const categoryService = {
  async list() {
    return categoryRepository.findAll();
  },

  async listActive() {
    return categoryRepository.findAll({ isActive: true });
  },

  async listInactive() {
    return categoryRepository.findAll({ isActive: false });
  },

  async listDeleted() {
    return categoryRepository.findDeleted();
  },

  async getById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw notFound();
    return category;
  },

  async getBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw notFound();
    return category;
  },

  async create(payload) {
    const slug = await uniqueSlug(payload.name);
    return categoryRepository.create({ ...payload, slug });
  },

  async update(id, payload) {
    // 1. Validar el id
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    // 2. Buscar la categoría
    const current = await categoryRepository.findById(id);
    if (!current) throw notFound();

    // 3. Preparar los datos: el slug solo cambia si cambia el nombre
    const data = { ...payload };
    if (payload.name !== undefined) {
      data.slug = await uniqueSlug(payload.name, id);
    }

    // 4. Guardar
    const updated = await categoryRepository.update(id, data);
    if (!updated) throw notFound();
    return updated;
  },

  async setActive(id, isActive) {
    const updated = await categoryRepository.update(id, { isActive });
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    const removed = await categoryRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  },

  async restore(id) {
    const restored = await categoryRepository.restore(id);
    if (!restored) throw new AppError("Categoría eliminada no encontrada", 404);
    return restored;
  }
};
