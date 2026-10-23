import { roleRepository } from "../repositories/role.repository.js";
import { AppError } from "../utils/app-error.js";
import { generateSlug } from "../utils/slug.util.js";

// Slug único a partir del nombre. Si ya existe, añade -2, -3...
async function uniqueSlug(name, excludeId = null) {
  const root = generateSlug(name) || "rol";
  let candidate = root;
  let suffix = 2;
  while (await roleRepository.slugExists(candidate, excludeId)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

const notFound = () => new AppError("Rol no encontrado", 404);

export const roleService = {
  async list() {
    return roleRepository.findAll();
  },

  async listActive() {
    return roleRepository.findAll({ isActive: true });
  },

  async listInactive() {
    return roleRepository.findAll({ isActive: false });
  },

  async listDeleted() {
    return roleRepository.findDeleted();
  },

  async getById(id) {
    const role = await roleRepository.findById(id);
    if (!role) throw notFound();
    return role;
  },

  async getBySlug(slug) {
    const role = await roleRepository.findBySlug(slug);
    if (!role) throw notFound();
    return role;
  },

  async create(payload) {
    const slug = await uniqueSlug(payload.name);
    return roleRepository.create({ ...payload, slug });
  },

  async update(id, payload) {
    // 1. Validar el id
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    // 2. Buscar la rol
    const current = await roleRepository.findById(id);
    if (!current) throw notFound();

    // 3. Preparar los datos: el slug solo cambia si cambia el nombre
    const data = { ...payload };
    if (payload.name !== undefined) {
      data.slug = await uniqueSlug(payload.name, id);
    }

    // 4. Guardar
    const updated = await roleRepository.update(id, data);
    if (!updated) throw notFound();
    return updated;
  },

  async setActive(id, isActive) {
    const updated = await roleRepository.update(id, { isActive });
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    const removed = await roleRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  },

  async restore(id) {
    const restored = await roleRepository.restore(id);
    if (!restored) throw new AppError("Rol eliminado no encontrado", 404);
    return restored;
  }
};
