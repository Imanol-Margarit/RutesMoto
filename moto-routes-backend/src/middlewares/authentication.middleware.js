import { accessTokenRepository } from "../repositories/access-token.repository.js";
import { AppError } from "../utils/app-error.js";
import { hashToken, verifyAccessToken } from "../utils/jwt.util.js";

const AUTH_REQUIRED = "Authentication required";

/**
 * Lee el access token de la cookie (req.cookies.access_token), comprueba firma y caducidad,
 * y que esté activo en la tabla access_tokens con su usuario activo y un rol válido (una sola consulta).
 * Deja los datos en req.user. Si falla: 401 (el frontend intentará /auth/refresh).
 */
export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) throw new AppError(AUTH_REQUIRED, 401);

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(AUTH_REQUIRED, 401);
    }

    const user = await accessTokenRepository.findActiveWithUser(hashToken(token));
    if (!user || !user.isActive) throw new AppError(AUTH_REQUIRED, 401);

    req.user = { id: user._id, email: user.email, role: user.role };
    req.auth = payload;

    return next();
  } catch (error) {
    return next(error);
  }
}
