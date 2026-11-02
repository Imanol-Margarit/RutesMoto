import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { AppError } from "../utils/app-error.js";
import { verifyToken } from "../utils/jwt.util.js";
import { revokedTokenRepository } from "../repositories/revoked-token.repository.js";

const AUTH_REQUIRED = "Authentication required";

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/** Comprueba el token y que el usuario siga existiendo y activo. Deja los datos en req.user. */
export async function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization) || req.cookies?.access_token;
    if (!token) throw new AppError(AUTH_REQUIRED, 401);

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError(AUTH_REQUIRED, 401);
    }

    if (await revokedTokenRepository.isRevoked(payload.jti)) throw new AppError(AUTH_REQUIRED, 401);

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) throw new AppError(AUTH_REQUIRED, 401);

    const role = await roleRepository.findById(user.roleId);
    req.user = { id: user._id, email: user.email, role: role?.name ?? "user" };
    req.auth = payload;

    return next();
  } catch (error) {
    return next(error);
  }
}
