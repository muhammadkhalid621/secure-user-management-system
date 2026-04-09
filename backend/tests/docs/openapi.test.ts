import { describe, expect, it } from "vitest";
import { DOCS_ROUTES } from "../../src/constants/docs.js";
import { openApiDocument } from "../../src/docs/openapi.js";

describe("openapi document", () => {
  it("exposes the expected metadata", () => {
    expect(openApiDocument.openapi).toBe("3.0.3");
    expect(openApiDocument.info.title).toBe("Mini Secure User Management API");
  });

  it("includes health and swagger json routes", () => {
    expect(openApiDocument.paths["/api/health"]).toBeDefined();
    expect(openApiDocument.paths[DOCS_ROUTES.JSON]).toBeDefined();
  });

  it("documents the main api groups", () => {
    expect(openApiDocument.paths["/api/auth/login"]).toBeDefined();
    expect(openApiDocument.paths["/api/audit-logs"]).toBeDefined();
    expect(openApiDocument.paths["/api/users"]).toBeDefined();
    expect(openApiDocument.paths["/api/roles"]).toBeDefined();
  });
});
