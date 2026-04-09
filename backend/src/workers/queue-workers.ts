import { Worker } from "bullmq";
import { config } from "../config.js";
import { auditLogService } from "../modules/audit-logs/audit-log.service.js";
import type {
  AuthLogJobData,
  NotificationJobData
} from "../modules/notifications/notification.types.js";
import { redisConnection } from "../queues/redis.js";
import { socketService } from "../sockets/socket.service.js";

export const startQueueWorkers = () => {
  const notificationWorker = new Worker<NotificationJobData>(
    config.bull.notificationsQueue,
    async (job) => {
      const payload = {
        event: job.data.event,
        message: job.data.message,
        entityType: job.data.entityType,
        entityId: job.data.entityId ?? null,
        actorUserId: job.data.actorUserId ?? null,
        payload: job.data.payload ?? null,
        createdAt: new Date().toISOString()
      };

      socketService.emitNotification(payload);

      await auditLogService.record({
        actorUserId: job.data.actorUserId ?? null,
        entityType: "websocket",
        entityId: job.data.entityId ?? null,
        action: "websocket.notification",
        message: `Notification emitted for ${job.data.event}`,
        metadata: payload
      });
    },
    {
      connection: redisConnection,
      prefix: config.bull.prefix
    }
  );

  const authWorker = new Worker<AuthLogJobData>(
    config.bull.authQueue,
    async (job) => {
      await auditLogService.record({
        actorUserId: job.data.actorUserId ?? null,
        entityType: "auth",
        entityId: job.data.entityId ?? null,
        action: job.data.action,
        message: job.data.message,
        level: job.data.level ?? "info",
        metadata: job.data.metadata ?? null
      });
    },
    {
      connection: redisConnection,
      prefix: config.bull.prefix
    }
  );

  return { notificationWorker, authWorker };
};
