export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  USERS: "/dashboard/users",
  ROLES: "/dashboard/roles",
  AUDIT_LOGS: "/dashboard/audit-logs",
  PROFILE: "/dashboard/profile"
} as const;

export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: "sums_access_token",
  REFRESH_TOKEN: "sums_refresh_token"
} as const;

export const PUBLIC_ONLY_ROUTES = [APP_ROUTES.LOGIN, APP_ROUTES.REGISTER] as const;
export const PROTECTED_ROUTES = [
  APP_ROUTES.DASHBOARD,
  APP_ROUTES.USERS,
  APP_ROUTES.ROLES,
  APP_ROUTES.AUDIT_LOGS,
  APP_ROUTES.PROFILE
] as const;

export const PERMISSIONS = {
  AUTH_PROFILE_READ: "auth.profile.read",
  AUDIT_LOGS_READ: "audit-logs.read",
  USERS_CREATE: "users.create",
  USERS_READ: "users.read",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  ROLES_CREATE: "roles.create",
  ROLES_READ: "roles.read",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  PERMISSIONS_READ: "permissions.read"
} as const;

export const QUERY_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10
} as const;
