import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import tasksRoutes from "./modules/tasks/tasks.routes";
import commentsRoutes from "./modules/comments/comments.routes";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  // Comments are nested under /api/tasks/:id/comments, so they share the
  // /api/tasks prefix and are mounted alongside the tasks router.
  app.use("/api/tasks", tasksRoutes);
  app.use("/api/tasks", commentsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
