import { ERROR_CODES } from "../../constants/error-codes.js";
import { HTTP_STATUS } from "../../constants/http.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { AppError } from "../../errors/app-error.js";
import { authService } from "./auth.service.js";

export const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new AppError(
      ERROR_MESSAGES.COMMON.MISSING_BEARER_TOKEN,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    );
  }

  return authorizationHeader.replace("Bearer ", "").trim();
};

export const resolveAccessTokenAuth = async (token: string) => {
  const payload = authService.verifyAccessToken(token);
  return authService.resolveAuthContext(payload.sub);
};
