// Tabla técnica: tokens JWT revocados en el logout.
export const revokedTokenModel = {
  table: "revoked_tokens",
  columns: {
    jti: "jti",
    userId: "user_id",
    expiresAt: "expires_at"
  },
  numeric: []
};