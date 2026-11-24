import { withTransaction } from "../config/db.js";
import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { profileRepository } from "../repositories/profile.repository.js";
import { refreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { accessTokenRepository } from "../repositories/access-token.repository.js";
import { AppError } from "../utils/app-error.js";
import {
  createAccessToken,
  generateRefreshToken,
  hashToken,
  refreshTokenExpiresAt,
  tokenExpiresAt
} from "../utils/jwt.util.js";
import { hashPassword, verifyPassword } from "../utils/password.util.js";

// El mismo mensaje para email desconocido y contraseña incorrecta: no revela qué existe.
const INVALID_CREDENTIALS = "Email o contraseña incorrectos";
const INVALID_SESSION = "Sesión no válida o caducada";
const CLIENT_ROLE_SLUG = "user";

/** Datos públicos del usuario: lo único que recibe el frontend. */
function toAuthUser(user) {
  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null
  };
}

/**
 * Crea el par access + refresh y guarda los dos (hasheados) en la BD, en la misma transacción.
 * Primero el refresh (para tener su id) y después el access enlazado a él.
 */
async function issueTokens(user, client) {
  if (!client) return withTransaction((tx) => issueTokens(user, tx));

  const accessToken = createAccessToken({ sub: user._id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken();

  await accessTokenRepository.deleteExpiredForUser(user._id, client);
  await refreshTokenRepository.deleteExpiredForUser(user._id, client);

  const refreshTokenId = await refreshTokenRepository.create(
    { userId: user._id, tokenHash: hashToken(refreshToken), expiresAt: refreshTokenExpiresAt() },
    client
  );
  await accessTokenRepository.create(
    { userId: user._id, refreshTokenId, tokenHash: hashToken(accessToken), expiresAt: tokenExpiresAt(accessToken) },
    client
  );

  return { accessToken, refreshToken };
}

/** Revoca todas las sesiones del usuario en las dos tablas. */
async function revokeAllSessions(userId) {
  await withTransaction(async (client) => {
    await refreshTokenRepository.revokeAllForUser(userId, client);
    await accessTokenRepository.revokeAllForUser(userId, client);
  });
}

/** Revoca un refresh y el access que generó. */
async function revokeSession(refreshTokenId, client) {
  const revoked = await refreshTokenRepository.revoke(refreshTokenId, client);
  await accessTokenRepository.revokeByRefreshId(refreshTokenId, client);
  return revoked;
}

/**
 * Los controllers reciben { accessToken, refreshToken, user }:
 * los tokens van a las cookies HttpOnly y al cliente solo se le envía { user }.
 */
export const authService = {
  /** Registro público de clientes: siempre con rol "user". Usuario y perfil en una transacción. */
  async register({ firstName, lastName, email, password }) {
    const role = await roleRepository.findBySlug(CLIENT_ROLE_SLUG);
    if (!role || !role.isActive) throw new AppError("El registro no está disponible", 500);

    const passwordHash = await hashPassword(password);

    const created = await withTransaction(async (client) => {
      const user = await userRepository.create(
        { roleId: role._id, firstName, lastName, email, passwordHash, isActive: true },
        client
      );
      await profileRepository.create(user._id, {}, client);
      return user;
    });

    // Tras registrarse, la sesión queda iniciada.
    const user = await userRepository.findAuthById(created._id);
    const tokens = await issueTokens(user);
    return { ...tokens, user: toAuthUser(user) };
  },

  async login(email, password) {
    const user = await userRepository.findAuthByEmail(email);
    if (!user || !user.isActive) throw new AppError(INVALID_CREDENTIALS, 401);

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) throw new AppError(INVALID_CREDENTIALS, 401);

    const tokens = await issueTokens(user);
    return { ...tokens, user: toAuthUser(user) };
  },

  /**
   * Rotación: el refresh token se usa una sola vez. Se revoca y se emite un par nuevo.
   * Si llega un token ya revocado, alguien lo ha reutilizado (posible robo):
   * se cierran todas las sesiones de ese usuario.
   */
  async refresh(refreshToken) {
    if (!refreshToken) throw new AppError(INVALID_SESSION, 401);

    const stored = await refreshTokenRepository.findByHash(hashToken(refreshToken));
    if (!stored) throw new AppError(INVALID_SESSION, 401);

    if (stored.status !== "active") {
      await revokeAllSessions(stored.userId);
      throw new AppError(INVALID_SESSION, 401);
    }
    if (new Date(stored.expiresAt) <= new Date()) {
      await withTransaction((client) => revokeSession(stored._id, client));
      throw new AppError(INVALID_SESSION, 401);
    }

    const user = await userRepository.findAuthById(stored.userId);
    if (!user || !user.isActive) {
      await revokeAllSessions(stored.userId);
      throw new AppError(INVALID_SESSION, 401);
    }

    // Revocar el par viejo (refresh + su access) y crear el nuevo en una transacción.
    // revoke() solo gana una vez: si dos /refresh llegan a la vez con el mismo token, el segundo da 401.
    const tokens = await withTransaction(async (client) => {
      const revoked = await revokeSession(stored._id, client);
      if (!revoked) throw new AppError(INVALID_SESSION, 401);
      return issueTokens(user, client);
    });

    return { ...tokens, user: toAuthUser(user) };
  },

  /** Revoca el refresh de esta sesión y su access: el access deja de servir al instante. */
  async logout(refreshToken) {
    if (!refreshToken) return;
    const stored = await refreshTokenRepository.findByHash(hashToken(refreshToken));
    if (!stored) return;
    await withTransaction((client) => revokeSession(stored._id, client));
  },

  async me(userId) {
    const user = await userRepository.findAuthById(userId);
    if (!user || !user.isActive) throw new AppError(INVALID_SESSION, 401);
    return { user: toAuthUser(user) };
  }
};
