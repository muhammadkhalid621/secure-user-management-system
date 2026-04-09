import { notificationsQueue } from "../../queues/bull.js";
import type { NotificationJobData } from "./notification.types.js";

export class NotificationService {
  async enqueue(data: NotificationJobData) {
    await notificationsQueue.add(data.event, data);
  }
}

export const notificationService = new NotificationService();

