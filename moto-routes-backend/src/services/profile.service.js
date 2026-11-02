import { profileRepository } from "../repositories/profile.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { withTransaction } from "../config/db.js";
import { roleRepository } from "../repositories/role.repository.js";
import { AppError } from "../utils/app-error.js";

const notFound = () => new AppError("Usuario no encontrado", 404);

export const profileService = {
  async getByUserId(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw notFound();

    const profile = (await profileRepository.findByUserId(userId))
      ?? { phone: null, bio: null, avatarUrl: null };

    const role = await roleRepository.findById(user.roleId);

    return {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: role?.name ?? "user",
        isActive: user.isActive,
      },
      profile: {
        phone: profile.phone,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      },
    };
  },

  async updateByUserId(userId, payload) {
    const user = await userRepository.findById(userId);
    if (!user) throw notFound();

    const { firstName, lastName, avatarUrl, ...profileFields } = payload;
    const userFields = { firstName, lastName, avatarUrl };
    const hasUserFields = Object.values(userFields).some((v) => v !== undefined);
    const hasProfileFields = Object.keys(profileFields).length > 0;

    await withTransaction(async (client) => {
      if (hasUserFields) {
        await userRepository.update(userId, userFields, client);
      }

      if (hasProfileFields) {
        const existing = await profileRepository.findByUserId(userId);
        if (!existing) await profileRepository.create(userId);
        await profileRepository.update(userId, profileFields, client);
      }
    });

    return this.getByUserId(userId);
  },
};
