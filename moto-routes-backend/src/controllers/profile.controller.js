import { userService } from "../services/user.service.js";
import { respond } from "../utils/response.util.js";

export const profileController = {
  async getMe(req, res, next) {
    try {
      const data = await userService.getById(req.user.id);
      return respond(res, 200, "Perfil obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
