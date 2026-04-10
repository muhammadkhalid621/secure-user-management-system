export type RoleSummary = {
  id: string;
  name: string;
  slug: string;
};

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  roles: RoleSummary[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type Permission = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Role = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  actorUserId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
  meta?: PaginationMeta;
};

export type CollectionResult<T> = {
  rows: T[];
  meta?: PaginationMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
};

export type AuthPayload = {
  user: SafeUser;
  tokens: AuthTokens;
};

export type SessionPayload = {
  user: SafeUser;
  socketToken: string | null;
};

export type NotificationPayload = {
  event: string;
  message: string;
  entityType: string;
  entityId: string | null;
  actorUserId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

export type DashboardSummary = {
  userTotal: number;
  roleTotal: number;
  recentLogCount: number;
  multiRoleUserCount: number;
  permissionsMapped: number;
  errorCount: number;
  roleDistribution: Array<{
    label: string;
    value: number;
    toneClassName: string;
  }>;
  recentLevels: Array<{
    label: string;
    value: number;
    toneClassName: string;
  }>;
};
