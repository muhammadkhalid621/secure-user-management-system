import { DOCS_ROUTES } from "../constants/docs.js";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Mini Secure User Management API",
    version: "1.0.0",
    description:
      "Backend API documentation for authentication, users, roles, permissions, notifications, and rate limiting."
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local development server"
    }
  ],
  tags: [
    { name: "System" },
    { name: "Auth" },
    { name: "Dashboard" },
    { name: "Audit Logs" },
    { name: "Users" },
    { name: "Roles" },
    { name: "Permissions" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              ok: { type: "boolean", example: true },
              app: { type: "string", example: "Mini Secure User Management API" },
              environment: { type: "string", example: "development" }
            }
          }
        }
      },
      AuthRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" }
        },
        required: ["email", "password"]
      },
      RegisterRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" }
        },
        required: ["name", "email", "password"]
      },
      RefreshRequest: {
        type: "object",
        properties: {
          refreshToken: { type: "string" }
        },
        required: ["refreshToken"]
      },
      UserRole: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          slug: { type: "string" }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          roles: {
            type: "array",
            items: { $ref: "#/components/schemas/UserRole" }
          },
          permissions: {
            type: "array",
            items: { type: "string" }
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Permission: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string", nullable: true }
        }
      },
      Role: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string", nullable: true },
          permissions: {
            type: "array",
            items: { $ref: "#/components/schemas/Permission" }
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" }
        }
      },
      AuditLog: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          actorUserId: { type: "string", format: "uuid", nullable: true },
          entityType: { type: "string" },
          entityId: { type: "string", nullable: true },
          action: { type: "string" },
          level: { type: "string", enum: ["info", "warn", "error"] },
          message: { type: "string" },
          metadata: { type: "object", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      DashboardSummary: {
        type: "object",
        properties: {
          userTotal: { type: "integer" },
          roleTotal: { type: "integer" },
          recentLogCount: { type: "integer" },
          multiRoleUserCount: { type: "integer" },
          permissionsMapped: { type: "integer" },
          errorCount: { type: "integer" },
          roleDistribution: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "integer" },
                toneClassName: { type: "string" }
              }
            }
          },
          recentLevels: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "integer" },
                toneClassName: { type: "string" }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { nullable: true }
            }
          }
        }
      }
    }
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Application health status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          "201": { description: "User registered" },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" }
            }
          }
        },
        responses: {
          "200": { description: "Login successful" },
          "401": {
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" }
            }
          }
        },
        responses: {
          "200": { description: "Token refreshed" }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" }
            }
          }
        },
        responses: {
          "200": { description: "Logout successful" }
        }
      }
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get current profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profile fetched" }
        }
      }
    },
    "/api/audit-logs": {
      get: {
        tags: ["Audit Logs"],
        summary: "List audit logs",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "sortBy", schema: { type: "string" } },
          { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] } },
          { in: "query", name: "level", schema: { type: "string", enum: ["info", "warn", "error"] } },
          { in: "query", name: "entityType", schema: { type: "string" } },
          { in: "query", name: "action", schema: { type: "string" } },
          { in: "query", name: "actorUserId", schema: { type: "string" } },
          { in: "query", name: "entityId", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Paginated audit logs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AuditLog" }
                    },
                    meta: { $ref: "#/components/schemas/PaginationMeta" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard summary metrics",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Dashboard summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/DashboardSummary" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "sortBy", schema: { type: "string" } },
          { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] } },
          { in: "query", name: "role", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Paginated users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" }
                    },
                    meta: { $ref: "#/components/schemas/PaginationMeta" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Users"],
        summary: "Create user",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "User created" }
        }
      }
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User found" }
        }
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User updated" }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User deleted" }
        }
      }
    },
    "/api/roles": {
      get: {
        tags: ["Roles"],
        summary: "List roles",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Paginated roles" } }
      },
      post: {
        tags: ["Roles"],
        summary: "Create role",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Role created" } }
      }
    },
    "/api/roles/{id}": {
      get: {
        tags: ["Roles"],
        summary: "Get role by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Role found" } }
      },
      put: {
        tags: ["Roles"],
        summary: "Update role",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Role updated" } }
      },
      delete: {
        tags: ["Roles"],
        summary: "Delete role",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Role deleted" } }
      }
    },
    "/api/roles/permissions/catalog": {
      get: {
        tags: ["Permissions"],
        summary: "List permissions",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Paginated permissions" } }
      }
    },
    [DOCS_ROUTES.JSON]: {
      get: {
        tags: ["System"],
        summary: "OpenAPI JSON document",
        responses: {
          "200": { description: "Swagger JSON document" }
        }
      }
    }
  }
} as const;
