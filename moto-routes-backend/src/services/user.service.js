import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword } from "../utils/password.util.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const notFound = () => new AppError("Usuario no encontrado", 404);

/** Convierte la contraseña en hash y la quita del payload: nunca se guarda en claro. */
async function withPasswordHash(payload) {
  const { password, ...rest } = payload;
  if (password === undefined) return rest;
  return { ...rest, passwordHash: await hashPassword(password) };
}

export const userService = {
  async list() {
    return userRepository.findAll();
  },

  async listActive() {
    return userRepository.findAll({ isActive: true });
  },

  async listInactive() {
    return userRepository.findAll({ isActive: false });
  },

  async listDeleted() {
    return userRepository.findDeleted();
  },

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw notFound();
    return user;
  },

  async create(payload) {
    const data = await withPasswordHash(payload);
    return userRepository.create(data);
  },

  async update(id, payload) {
    // 1. Validar el id
    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    // 2. Buscar el usuario
    const current = await userRepository.findById(id);
    if (!current) throw notFound();

    // 3. Preparar los datos (la contraseña solo se cambia si llega)
    const data = await withPasswordHash(payload);

    // 4. Guardar
    const updated = await userRepository.update(id, data);
    if (!updated) throw notFound();
    return updated;
  },

  async setActive(id, isActive) {
    const updated = await userRepository.update(id, { isActive });
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id) {
    const removed = await userRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  },

  async restore(id) {
    const restored = await userRepository.restore(id);
    if (!restored) throw new AppError("Usuario eliminado no encontrado", 404);
    return restored;
  }
};
