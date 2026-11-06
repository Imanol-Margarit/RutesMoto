import { authService } from "../services/auth.service.js";
import { respond } from "../utils/response.util.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export const authController = {
  // La cookie access_token la lee el navegador sola; el cuerpo devuelve el token para el store del frontend.
  async login(req, res, next) {
    try {
      const data = await authService.login(req.body.email, req.body.password);

      res.cookie("access_token", data.token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 1000 });
      return respond(res, 200, "Inicio de sesión correcto", data);
    } catch (error) {
      return next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.auth);
      res.clearCookie("access_token", COOKIE_OPTIONS);
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
  },

  // Al recargar la página: devuelve el token (leído de la cookie) y el usuario, para volver a cargar el store.
  async session(req, res, next) {
    try {
      const token = req.cookies?.access_token || req.headers.authorization?.split(" ")[1];
      const data = await authService.me(req.user.id);
      return respond(res, 200, "Sesión activa", { token, ...data });
    } catch (error) {
      return next(error);
    }
  },
};
