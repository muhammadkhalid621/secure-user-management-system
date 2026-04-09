import { authQueue } from "../../queues/bull.js";
import type { AuthLogJobData } from "../notifications/notification.types.js";

export class AuthEventService {
  async enqueue(data: AuthLogJobData) {
    await authQueue.add(data.action, data);
  }
}

export const authEventService = new AuthEventService();

