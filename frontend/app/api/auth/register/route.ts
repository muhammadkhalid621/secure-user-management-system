import { proxyAuthMutation } from "@/lib/server-api";

export async function POST(request: Request) {
  return proxyAuthMutation({
    backendPath: "/auth/register",
    fallbackCode: "REGISTER_FAILED",
    fallbackMessage: "Registration failed",
    request
  });
}
