import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
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
      user: { _id: user._id, email: user.email, role: roleName }
    };
  }
};
