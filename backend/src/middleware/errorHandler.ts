import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Global error handler. Normalizes ApiError, Prisma errors, and unexpected
 * exceptions into a consistent JSON error shape. This is the Express
 * equivalent of a Spring @ControllerAdvice / @ExceptionHandler layer.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details,
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: { message: "A record with these unique fields already exists" },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: { message: "Resource not found" } });
    }
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: { message: "Internal server error" },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.path} not found` } });
}
