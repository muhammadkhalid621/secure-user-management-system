import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { config } from "../config.js";
import { auditLogService } from "../modules/audit-logs/audit-log.service.js";

class SocketService {
  private io?: Server;

  initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: config.socket.corsOrigin,
        credentials: true
      }
    });

    this.io.on("connection", (socket) => {
      void auditLogService.record({
        entityType: "websocket",
        entityId: socket.id,
        action: "websocket.connect",
        message: "WebSocket client connected",
        metadata: {
          socketId: socket.id
        }
      });

      socket.on("disconnect", (reason) => {
        void auditLogService.record({
          entityType: "websocket",
          entityId: socket.id,
          action: "websocket.disconnect",
          message: "WebSocket client disconnected",
          metadata: {
            socketId: socket.id,
            reason
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

