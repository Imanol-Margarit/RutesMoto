import { authService } from "../services/auth.service.js";
import { respond } from "../utils/response.util.js";

export const authController = {
  async login(req, res, next) {
    try {
      const data = await authService.login(req.body.email, req.body.password);
      return respond(res, 200, "Inicio de sesión correcto", data);
    } catch (error) {
      return next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.auth);
      return respond(res, 200, "Sesión cerrada correctamente", null);
    } catch (error) {
      return next(error);
    }
  }
};
