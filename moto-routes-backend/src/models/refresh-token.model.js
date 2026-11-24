// Tabla técnica: refresh tokens de 7 días. Solo se guarda el hash (SHA-256) del token.
export const refreshTokenModel = {
  table: "refresh_tokens",
  columns: {
    userId: "user_id",
    tokenHash: "token_hash",
    status: "status",
    expiresAt: "expires_at",
    revokedAt: "revoked_at"
  },
  numeric: []
};
