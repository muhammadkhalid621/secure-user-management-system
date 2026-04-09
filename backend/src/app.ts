import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./config.js";
import { DOCS_ROUTES } from "./constants/docs.js";
import "./database/models/audit-log.model.js";
import "./database/models/permission.model.js";
import "./database/models/role.model.js";
import "./database/models/user.model.js";
import { initModels } from "./database/models/init-models.js";
import { openApiDocument } from "./docs/openapi.js";
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

app.get(DOCS_ROUTES.JSON, (_req, res) => {
  res.json(openApiDocument);
});
app.use(DOCS_ROUTES.UI, swaggerUi.serve, swaggerUi.setup(openApiDocument));

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
