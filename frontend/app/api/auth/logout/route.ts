import { cookies } from "next/headers";
import { AUTH_COOKIE_NAMES } from "@/lib/constants";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { requestBackend, successJson } from "@/lib/server-api";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (refreshToken) {
    await requestBackend("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    }, accessToken).catch(() => null);
  }

  const response = successJson({
    loggedOut: true
  });
  clearAuthCookies(response);
  return response;
}
