// Tabla técnica: access tokens de 1 h (lista blanca). Solo se guarda el hash (SHA-256) del JWT.
export const accessTokenModel = {
  table: "access_tokens",
  columns: {
    userId: "user_id",
    refreshTokenId: "refresh_token_id",
    tokenHash: "token_hash",
    status: "status",
    expiresAt: "expires_at",
    revokedAt: "revoked_at"
  },
  numeric: []
};
