export const AUTH_TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh"
} as const;

export const AUTH_REDIS_KEYS = {
  refreshActive: (tokenHash: string) => `auth:refresh:active:${tokenHash}`,
  refreshRevoked: (tokenHash: string) => `auth:refresh:revoked:${tokenHash}`
} as const;

