import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const appName = process.env.APP_NAME ?? "Mini Secure User Management API";
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const apiPrefix = process.env.API_PREFIX ?? "api";

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get(`/${apiPrefix}/health`, (_req, res) => {
  res.json({
    ok: true,
    app: appName,
    environment: process.env.NODE_ENV ?? "development"
  });
});

app.listen(port, () => {
  console.log(`${appName} listening on http://localhost:${port}`);
});

