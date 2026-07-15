import { Router } from "express";
import { Role } from "@prisma/client";
import { commentsController } from "./comments.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createCommentSchema } from "./comments.dto";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/tasks/{id}/comments:
 *   get:
 *     summary: List comments on a task
 *     tags: [Comments]
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 */
router.get("/:id/comments", authorize(Role.MEMBER, Role.MANAGER, Role.ADMIN), commentsController.list);
router.post(
  "/:id/comments",
  authorize(Role.MEMBER, Role.MANAGER, Role.ADMIN),
  validate(createCommentSchema),
  commentsController.create
);

export default router;
