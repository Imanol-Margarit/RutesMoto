import { profileRepository } from "../repositories/profile.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";

const notFound = () => new AppError("Usuario no encontrado", 404);

export const profileService = {
  async getByUserId(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw notFound();

    // Un usuario creado antes de esta tabla puede no tener fila: se devuelve un perfil vacío.
    const profile = await profileRepository.findByUserId(userId);
    return profile ?? { userId, phone: null, bio: null, avatarUrl: null };
  },

  async updateByUserId(userId, payload) {
    const user = await userRepository.findById(userId);
    if (!user) throw notFound();

    const existing = await profileRepository.findByUserId(userId);
    if (!existing) return profileRepository.create(userId, payload);
    return profileRepository.update(userId, payload);
  }
};
