import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { DOCS_ROUTES } from "../../src/constants/docs.js";

const shouldRunIntegration = process.env.RUN_NETWORK_TESTS === "true";

const describeIntegration = shouldRunIntegration ? describe : describe.skip;

describeIntegration("app integration", () => {
  vi.mock("../../src/middlewares/rate-limit.middleware.js", () => ({
    createRateLimitMiddleware: () => (_req: unknown, _res: unknown, next: (error?: unknown) => void) =>
      next()
  }));

  vi.mock("../../src/database/models/init-models.js", () => ({
    initModels: vi.fn()
  }));

  it("returns health status", async () => {
    const { app } = await import("../../src/app.js");
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        ok: true
      }
    });
  });

  it("returns the openapi document", async () => {
    const { app } = await import("../../src/app.js");
    const response = await request(app).get(DOCS_ROUTES.JSON);

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths["/api/health"]).toBeDefined();
  });

  it("returns a structured 404 response for unknown routes", async () => {
    const { app } = await import("../../src/app.js");
    const response = await request(app).get("/api/not-a-real-route");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: "ROUTE_NOT_FOUND"
      }
    });
  });
});
