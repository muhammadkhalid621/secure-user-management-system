import { beforeEach, describe, expect, it, vi } from "vitest";
import { SUCCESS_MESSAGES } from "../../src/constants/messages.js";
import { createMockContext, getRouteHandlers, runHandlers } from "../helpers/router.js";

const roleServiceMock = {
  create: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByIdOrThrow: vi.fn()
};

const permissionServiceMock = {
  ensureAllExist: vi.fn(),
  list: vi.fn()
};

const authServiceMock = {
  verifyAccessToken: vi.fn(),
  resolveAuthContext: vi.fn()
};

vi.mock("../../src/modules/roles/role.service.js", () => ({
  roleService: roleServiceMock
}));

vi.mock("../../src/modules/permissions/permission.service.js", () => ({
  permissionService: permissionServiceMock
}));

vi.mock("../../src/modules/auth/auth.service.js", () => ({
  authService: authServiceMock
}));

const { rolesRouter } = await import("../../src/routes/roles.routes.js");

describe("roles routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authServiceMock.verifyAccessToken.mockReturnValue({
      sub: "admin-1",
      email: "admin@example.com",
      type: "access",
      exp: Date.now() / 1000 + 900,
      iat: Date.now() / 1000
    });
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "admin-1",
      email: "admin@example.com",
      roles: ["admin"],
      permissions: [
        "roles.create",
        "roles.read",
        "roles.update",
        "roles.delete",
        "permissions.read"
      ]
    });
  });

  it("creates a role", async () => {
    roleServiceMock.create.mockResolvedValue({ id: "role-1" });

    const handlers = getRouteHandlers(rolesRouter, "post", "/");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" },
      body: {
        name: "Manager",
        slug: "manager",
        permissionIds: ["perm-1"]
      }
    });

    await runHandlers(handlers, req, res);

    expect(permissionServiceMock.ensureAllExist).toHaveBeenCalledWith(["perm-1"]);
    expect(res.body).toMatchObject({
      success: true,
      message: SUCCESS_MESSAGES.ROLES.CREATED
    });
  });

  it("lists roles with meta", async () => {
    roleServiceMock.list.mockResolvedValue({
      rows: [{ id: "role-1" }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });

    const handlers = getRouteHandlers(rolesRouter, "get", "/");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" }
    });

    await runHandlers(handlers, req, res);

    expect(res.body).toMatchObject({
      success: true,
      data: [{ id: "role-1" }],
      meta: { total: 1 }
    });
  });

  it("lists permission catalog", async () => {
    permissionServiceMock.list.mockResolvedValue({
      rows: [{ id: "perm-1" }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });

    const handlers = getRouteHandlers(rolesRouter, "get", "/permissions/catalog");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" }
    });

    await runHandlers(handlers, req, res);

    expect(res.body).toMatchObject({
      success: true,
      data: [{ id: "perm-1" }]
    });
  });

  it("gets a role by id", async () => {
    roleServiceMock.findByIdOrThrow.mockResolvedValue({ id: "role-1" });

    const handlers = getRouteHandlers(rolesRouter, "get", "/:id");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" },
      params: { id: "role-1" }
    });

    await runHandlers(handlers, req, res);

    expect(res.body).toMatchObject({
      success: true,
      data: { id: "role-1" }
    });
  });
});

