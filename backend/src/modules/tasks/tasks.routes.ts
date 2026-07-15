import { Router } from "express";
import { Role } from "@prisma/client";
import { tasksController } from "./tasks.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from "./tasks.dto";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     summary: Create a task (Manager, Admin)
 *     tags: [Tasks]
 *   get:
 *     summary: List tasks with optional filters (status, priority, assignedTo)
 *     tags: [Tasks]
 */
router.post("/", authorize(Role.MANAGER, Role.ADMIN), validate(createTaskSchema), tasksController.create);
router.get(
  "/",
  authorize(Role.MEMBER, Role.MANAGER, Role.ADMIN),
  validate(taskQuerySchema, "query"),
  tasksController.list
);

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Tasks]
 *   put:
 *     summary: Update a task (Member limited to status; Manager/Admin full)
 *     tags: [Tasks]
 *   delete:
 *     summary: Delete a task (Manager, Admin)
 *     tags: [Tasks]
 */
router.get("/:id", authorize(Role.MEMBER, Role.MANAGER, Role.ADMIN), tasksController.getById);
router.put(
  "/:id",
  authorize(Role.MEMBER, Role.MANAGER, Role.ADMIN),
  validate(updateTaskSchema),
  tasksController.update
);
router.delete("/:id", authorize(Role.MANAGER, Role.ADMIN), tasksController.remove);

export default router;
