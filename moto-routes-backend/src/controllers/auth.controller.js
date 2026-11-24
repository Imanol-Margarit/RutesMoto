import { authService } from "../services/auth.service.js";
import { respond } from "../utils/response.util.js";
import { REFRESH_TOKEN_MAX_AGE_MS, tokenMaxAgeMs } from "../utils/jwt.util.js";

const BASE_COOKIE = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production"
};
// access_token viaja a toda la API; refresh_token solo a /api/auth (refresh y logout).
// clearCookie necesita las MISMAS opciones (sobre todo path) o el navegador no la borra.
const ACCESS_COOKIE = { ...BASE_COOKIE, path: "/api" };
const REFRESH_COOKIE = { ...BASE_COOKIE, path: "/api/auth" };

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie("access_token", accessToken, { ...ACCESS_COOKIE, maxAge: tokenMaxAgeMs(accessToken) });
  res.cookie("refresh_token", refreshToken, { ...REFRESH_COOKIE, maxAge: REFRESH_TOKEN_MAX_AGE_MS });
}

function clearAuthCookies(res) {
  res.clearCookie("access_token", ACCESS_COOKIE);
  res.clearCookie("refresh_token", REFRESH_COOKIE);
}

// Los tokens solo viajan en cookies HttpOnly: el cuerpo de la respuesta nunca los incluye.
export const authController = {
  async register(req, res, next) {
    try {
      const { user, ...tokens } = await authService.register(req.body);
      setAuthCookies(res, tokens);
      return respond(res, 201, "Cuenta creada correctamente", { user });
    } catch (error) {
      return next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { user, ...tokens } = await authService.login(req.body.email, req.body.password);
      setAuthCookies(res, tokens);
      return respond(res, 200, "Inicio de sesión correcto", { user });
    } catch (error) {
      return next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const { user, ...tokens } = await authService.refresh(req.cookies?.refresh_token);
      setAuthCookies(res, tokens);
      return respond(res, 200, "Sesión renovada", { user });
    } catch (error) {
      // Refresh inválido: se borran las cookies para no volver a intentarlo con las mismas.
      clearAuthCookies(res);
      return next(error);
    }
  },

  // No exige access token: debe funcionar aunque haya caducado. Las cookies se borran siempre.
  async logout(req, res, next) {
    try {
      await authService.logout(req.cookies?.refresh_token);
      clearAuthCookies(res);
      return respond(res, 200, "Sesión cerrada correctamente", null);
    } catch (error) {
      clearAuthCookies(res);
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
