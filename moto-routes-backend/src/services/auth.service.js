import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { revokedTokenRepository } from "../repositories/revoked-token.repository.js";
import { AppError } from "../utils/app-error.js";
import { createToken } from "../utils/jwt.util.js";
import { verifyPassword } from "../utils/password.util.js";

// El mismo mensaje para email desconocido y contraseña incorrecta: no revela qué existe.
const INVALID_CREDENTIALS = "Email o contraseña incorrectos";

export const authService = {
  async login(email, password) {
    const user = await userRepository.findAuthByEmail(email);
    if (!user || !user.isActive) throw new AppError(INVALID_CREDENTIALS, 401);

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) throw new AppError(INVALID_CREDENTIALS, 401);

    const role = await roleRepository.findById(user.roleId);
    const roleName = role?.name ?? "user";

    const token = createToken({ sub: user._id, email: user.email, role: roleName });

     return {
      token,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleName,
      },
    };
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("Usuario no encontrado", 404);

    const role = await roleRepository.findById(user.roleId);

    return {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: role?.name ?? "user",
        avatarUrl: user.avatarUrl ?? null,
      },
    };
  },
  // Revoca el token actual: se guarda en PostgreSQL hasta su caducidad.
  async logout(auth) {
    await revokedTokenRepository.revoke(auth.jti, auth.sub, new Date(auth.exp * 1000));
  }
};
