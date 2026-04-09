import { ERROR_CODES } from "../../constants/error-codes.js";
import { HTTP_STATUS } from "../../constants/http.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { AppError } from "../../errors/app-error.js";
import { userService } from "../users/user.service.js";
import type { AuthContext } from "./auth.types.js";

export class AuthContextService {
  async resolve(userId: string): Promise<AuthContext> {
    const user = await userService.findSafeByIdOrThrow(userId);

    if (user.roles.length === 0) {
      throw new AppError(
        ERROR_MESSAGES.AUTH.USER_HAS_NO_ROLES,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    return {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.slug),
      permissions: user.permissions
    };
  }
}

export const authContextService = new AuthContextService();
