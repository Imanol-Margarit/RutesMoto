import { authService } from "../services/auth.service.js";
import { respond } from "../utils/response.util.js";

export const authController = {
  async login(req, res, next) {
    try {
      const data = await authService.login(req.body.email, req.body.password);

      res.cookie("access_token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000,
      });

      const { token, ...rest } = data;
      return respond(res, 200, "Inicio de sesión correcto", rest);
    } catch (error) {
      return next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.auth);
      res.clearCookie("access_token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return respond(res, 200, "Sesión cerrada correctamente", null);
    } catch (error) {
      return next(error);
    }
  },

  async me(req, res, next) {
    try {
      const data = await authService.me(req.user.id);
      return respond(res, 200, "Usuario obtenido correctamente", data);
    } catch (error) {
      return next(error);
    }
  }
};
