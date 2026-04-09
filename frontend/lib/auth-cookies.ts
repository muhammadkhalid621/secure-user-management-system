import type { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "./constants";
import type { AuthTokens } from "./types";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const SEVEN_DAYS_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export const setAuthCookies = (response: NextResponse, tokens: AuthTokens) => {
  response.cookies.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: ONE_DAY_IN_SECONDS
  });
  response.cookies.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: SEVEN_DAYS_IN_SECONDS
  });
};

export const clearAuthCookies = (response: NextResponse) => {
  response.cookies.set(AUTH_COOKIE_NAMES.ACCESS_TOKEN, "", {
    ...baseCookieOptions,
    maxAge: 0
  });
  response.cookies.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, "", {
    ...baseCookieOptions,
    maxAge: 0
  });
};
