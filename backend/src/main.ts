import { createServer } from "node:http";
import { app } from "./app.js";
import { config } from "./config.js";
import { sequelize } from "./database/sequelize.js";
import { socketService } from "./sockets/socket.service.js";
import { startQueueWorkers } from "./workers/queue-workers.js";

const bootstrap = async () => {
  await sequelize.authenticate();
  const server = createServer(app);
  socketService.initialize(server);
  startQueueWorkers();

  server.listen(config.port, () => {
    console.log(`${config.appName} listening on http://localhost:${config.port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start application", error);
  process.exit(1);
});
