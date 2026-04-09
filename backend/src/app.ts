import cors from "cors";
import express from "express";
import { config } from "./config.js";
import "./database/models/audit-log.model.js";
import "./database/models/permission.model.js";
import "./database/models/role.model.js";
import "./database/models/user.model.js";
import { initModels } from "./database/models/init-models.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { apiRouter } from "./routes/index.js";

export const app = express();
initModels();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true
  })
);
app.use(express.json());

app.get(`/${config.apiPrefix}/health`, (_req, res) => {
  res.json({
    success: true,
    data: {
      ok: true,
      app: config.appName,
      environment: config.nodeEnv
    }
  });
});

app.use(`/${config.apiPrefix}`, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
