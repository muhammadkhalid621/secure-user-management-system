import { expect, test } from "@playwright/test";

test("shows validation on invalid login and redirects on successful login", async ({ page }) => {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized"
        }
      })
    });
  });

  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            roles: [{ id: "r1", name: "Admin", slug: "admin" }],
            permissions: ["users.read", "roles.read", "audit-logs.read"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          tokens: {
            accessToken: "access-token",
            refreshToken: "refresh-token",
            accessTokenExpiresIn: "15m",
            refreshTokenExpiresIn: "7d"
          }
        }
      })
    });
  });

  await page.route("**/api/users?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 1 }
      })
    });
  });

  await page.route("**/api/roles?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 1 }
      })
    });
  });

  await page.route("**/api/audit-logs?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [],
        meta: { page: 1, limit: 5, total: 0, totalPages: 1 }
      })
    });
  });

  await page.goto("/login");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page.getByText(/enter a valid email address/i)).toBeVisible();
  await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();

  await page.getByPlaceholder("Email address").fill("admin@example.com");
  await page.getByPlaceholder("Password").fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/secure operations with a cleaner admin workflow/i)).toBeVisible();
});
