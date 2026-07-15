import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

type Segment = "body" | "query" | "params";

/**
 * Validates req[segment] against a zod schema. On success, replaces the
 * segment with the parsed (and coerced/defaulted) value. On failure,
 * forwards a 400 ApiError with field-level details.
 *
 * Accepts any ZodSchema (not just ZodObject) so schemas built with
 * .refine()/.transform() — which return ZodEffects rather than a plain
 * ZodObject — type-check correctly here too.
 */
export function validate(schema: ZodSchema, segment: Segment = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[segment]);
      req[segment] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(ApiError.badRequest("Validation failed", err.flatten()));
      }
      next(err);
    }
  };
}
