export const SUCCESS_MESSAGES = {
  AUTH: {
    REGISTERED: "User registered successfully",
    LOGIN: "Login successful",
    REFRESH: "Token refreshed successfully",
    LOGOUT: "Logout successful"
  },
  USERS: {
    CREATED: "User created successfully",
    UPDATED: "User updated successfully",
    DELETED: "User deleted successfully"
  },
  ROLES: {
    CREATED: "Role created successfully",
    UPDATED: "Role updated successfully",
    DELETED: "Role deleted successfully"
  }
} as const;

export const ERROR_MESSAGES = {
  COMMON: {
    INTERNAL_SERVER_ERROR: "Something went wrong",
    ROUTE_NOT_FOUND: "Route not found",
    REQUEST_BODY_OBJECT: "Request body must be an object",
    OPTIONAL_STRING_INVALID: "Invalid optional string field",
    INVALID_EMAIL: "Invalid email address",
    PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
    MISSING_BEARER_TOKEN: "Missing bearer token",
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
    RATE_LIMIT_EXCEEDED: "Too many requests, please try again later"
  },
  AUTH: {
    INVALID_TOKEN_PAYLOAD: "Invalid token payload",
    INVALID_TOKEN_FORMAT: "Invalid token format",
    INVALID_TOKEN_SIGNATURE: "Invalid token signature",
    INVALID_ACCESS_TOKEN_TYPE: "Invalid access token type",
    INVALID_REFRESH_TOKEN: "Refresh token is not active",
    INVALID_REFRESH_TOKEN_TYPE: "Invalid refresh token type",
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Token expired",
    USER_HAS_NO_ROLES: "User has no assigned roles",
    SOCKET_TOKEN_REQUIRED: "WebSocket authentication token is required"
  },
  USERS: {
    NOT_FOUND: "User not found",
    EMAIL_EXISTS: "Email already exists",
    ROLE_ASSIGNMENT_FORBIDDEN: "You are not allowed to change role assignments"
  },
  ROLES: {
    NOT_FOUND: "Role not found",
    SLUG_EXISTS: "Role slug already exists"
  },
  PERMISSIONS: {
    INVALID_SELECTION: "One or more permissions are invalid"
  },
  AUDIT_LOGS: {
    NOT_FOUND: "Audit log not found"
  }
} as const;

export const MESSAGE_BUILDERS = {
  missingEnvVar: (key: string) => `Missing required environment variable: ${key}`,
  invalidField: (key: string) => `Invalid field: ${key}`,
  invalidQueryParam: (key: string) => `Invalid query param: ${key}`,
  userMutation: (action: "create" | "update" | "delete") =>
    `User ${action}d successfully`,
  roleMutation: (action: "create" | "update" | "delete") =>
    `Role ${action}d successfully`,
  notificationEmitted: (event: string) => `Notification emitted for ${event}`,
  notificationMutation: (
    entity: "user" | "role",
    action: "create" | "update" | "delete"
  ) => `${entity === "user" ? "User" : "Role"} ${action}d`,
  socketConnected: "WebSocket client connected",
  socketDisconnected: "WebSocket client disconnected",
  failedBootstrap: "Failed to start application",
  failedLoginAttempt: "Failed login attempt",
  successfulLoginNotification: "Successful login",
  apiError: (method: string, path: string) => `API error on ${method.toUpperCase()} ${path}`,
  apiErrorFallback: "Failed to persist API error log"
} as const;
