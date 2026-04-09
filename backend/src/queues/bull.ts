import { Queue } from "bullmq";
import { config } from "../config.js";
import { redisConnection } from "./redis.js";

export const authQueue = new Queue(config.bull.authQueue, {
  connection: redisConnection,
  prefix: config.bull.prefix,
  defaultJobOptions: {
    attempts: config.bull.defaults.attempts,
    backoff: {
      type: "fixed",
      delay: config.bull.defaults.backoffMs
    },
    removeOnComplete: true
  }
});

export const notificationsQueue = new Queue(config.bull.notificationsQueue, {
  connection: redisConnection,
  prefix: config.bull.prefix,
  defaultJobOptions: {
    attempts: config.bull.defaults.attempts,
    backoff: {
      type: "fixed",
      delay: config.bull.defaults.backoffMs
    },
    removeOnComplete: true
  }
});
