import { profileService } from "../services/profile.service.js";
import { respond } from "../utils/response.util.js";

export const profileController = {
  async getMe(req, res, next) {
    try {
      const data = await profileService.getByUserId(req.user.id);
      return respond(res, 200, "Perfil obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  },

  async updateMe(req, res, next) {
    try {
      const data = await profileService.updateByUserId(req.user.id, req.body);
      return respond(res, 200, "Perfil actualizado correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
