import React from "react";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { AuthForm } from "@/components/auth-form";
import { renderWithStore } from "@/tests/test-utils";

const {
  replaceMock,
  toastSuccessMock,
  toastErrorMock
} = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock
  })
}));

vi.mock("@/lib/toast", () => ({
  appToast: {
    success: toastSuccessMock,
    error: toastErrorMock
  }
}));

vi.mock("@/store/auth-slice", async () => {
  const actual = await vi.importActual<typeof import("@/store/auth-slice")>("@/store/auth-slice");

  return {
    ...actual,
    login: (payload: { email: string; password: string }) =>
      actual.login.fulfilled(
        {
          user: {
            id: "1",
            name: "Demo User",
            email: payload.email,
            roles: [],
            permissions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          socketToken: "socket-token"
        },
        "request-id",
        payload
      )
  };
});

describe("AuthForm", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("shows inline validation for invalid registration input", async () => {
    renderWithStore(<AuthForm mode="register" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect((await screen.findAllByText(/full name must be at least 2 characters/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/enter a valid email address/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/password must be at least 8 characters/i).length).toBeGreaterThan(0);
  });

  it("submits valid login input and redirects to the dashboard", async () => {
    renderWithStore(<AuthForm mode="login" />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/email address/i), "demo@example.com");
    await user.type(screen.getByPlaceholderText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });
    expect(toastSuccessMock).toHaveBeenCalled();
  });
});
