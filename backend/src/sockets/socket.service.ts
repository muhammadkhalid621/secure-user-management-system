import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { config } from "../config.js";
import { ERROR_MESSAGES, MESSAGE_BUILDERS } from "../constants/messages.js";
import { auditLogService } from "../modules/audit-logs/audit-log.service.js";
import {
  getBearerToken,
  resolveAccessTokenAuth
} from "../modules/auth/access-token.service.js";

type SocketHandshakeAuth = {
  token?: unknown;
};

const getAuthorizationToken = (
  auth: SocketHandshakeAuth,
  authorizationHeader: string | string[] | undefined
) => {
  if (typeof auth.token === "string" && auth.token.trim() !== "") {
    return auth.token.trim();
  }

  const headerValue = Array.isArray(authorizationHeader)
    ? authorizationHeader[0]
    : authorizationHeader;

  if (typeof headerValue !== "string") {
    return undefined;
  }

  try {
    return getBearerToken(headerValue);
  } catch {
    return undefined;
  }
};

class SocketService {
  private io?: Server;

  initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: config.socket.corsOrigin,
        credentials: true
      }
    });

    if (config.socket.authRequired) {
      this.io.use(async (socket, next) => {
        try {
          const token = getAuthorizationToken(
            socket.handshake.auth as SocketHandshakeAuth,
            socket.handshake.headers.authorization
          );

          if (!token) {
            throw new Error(ERROR_MESSAGES.AUTH.SOCKET_TOKEN_REQUIRED);
          }

          const authContext = await resolveAccessTokenAuth(token);

          socket.data.auth = authContext;
          socket.join(authContext.userId);
          next();
        } catch (error) {
          void auditLogService.record({
            entityType: "websocket",
            entityId: socket.id,
            action: "websocket.auth.failed",
            level: "warn",
            message:
              error instanceof Error
                ? error.message
                : ERROR_MESSAGES.COMMON.UNAUTHORIZED,
            metadata: {
              socketId: socket.id
            }
          });
          next(new Error(ERROR_MESSAGES.COMMON.UNAUTHORIZED));
        }
      });
    }

    this.io.on("connection", (socket) => {
      const socketAuth = socket.data.auth as
        | { userId: string; email: string; roles: string[]; permissions: string[] }
        | undefined;

      void auditLogService.record({
        actorUserId: socketAuth?.userId ?? null,
        entityType: "websocket",
        entityId: socket.id,
        action: "websocket.connect",
        message: MESSAGE_BUILDERS.socketConnected,
        metadata: {
          socketId: socket.id,
          userId: socketAuth?.userId ?? null,
          email: socketAuth?.email ?? null
        }
      });

      socket.on("disconnect", (reason) => {
        void auditLogService.record({
          actorUserId: socketAuth?.userId ?? null,
          entityType: "websocket",
          entityId: socket.id,
          action: "websocket.disconnect",
          message: MESSAGE_BUILDERS.socketDisconnected,
          metadata: {
            socketId: socket.id,
            reason,
            userId: socketAuth?.userId ?? null,
            email: socketAuth?.email ?? null
          }
        });
      });
    });
  }

  emitNotification(payload: Record<string, unknown>) {
    if (!this.io) {
      return;
    }

    this.io.emit(config.socket.notificationEvent, payload);
  }
}

export const socketService = new SocketService();
