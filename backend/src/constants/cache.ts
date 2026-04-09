export const CACHE_KEYS = {
  users: {
    list: () => "users:list",
    detail: (userId: string) => `users:detail:${userId}`
  },
  auth: {
    profile: (userId: string) => `auth:profile:${userId}`
  }
} as const;

export const CACHE_PATTERNS = {
  users: "users:*",
  authProfiles: "auth:profile:*"
} as const;

