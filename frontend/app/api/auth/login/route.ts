import { proxyAuthMutation } from "@/lib/server-api";

export async function POST(request: Request) {
  return proxyAuthMutation({
    backendPath: "/auth/login",
    fallbackCode: "LOGIN_FAILED",
    fallbackMessage: "Login failed",
    request
  });
}
