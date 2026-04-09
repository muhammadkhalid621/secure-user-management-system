import React from "react";
import { screen } from "@testing-library/react";
import { DashboardShell } from "@/components/dashboard-shell";
import { renderWithStore } from "@/tests/test-utils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    replace: vi.fn()
  })
}));

describe("DashboardShell", () => {
  it("shows only links allowed by the current permission set", () => {
    renderWithStore(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>,
      {
        preloadedState: {
          auth: {
            user: {
              id: "1",
              name: "Admin User",
              email: "admin@example.com",
              roles: [{ id: "r1", name: "Admin", slug: "admin" }],
              permissions: ["users.read", "audit-logs.read"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            socketToken: "socket-token",
            status: "authenticated",
            error: null,
            initialized: true
          },
          notifications: {
            items: []
          }
        }
      }
    );

    expect(screen.getByRole("link", { name: /users/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /audit logs/i })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /roles/i })).toBeNull();
  });
});
