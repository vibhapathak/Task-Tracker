import { Router } from "express";
import { Role } from "@prisma/client";
import { usersController } from "./users.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { updateRoleSchema } from "./users.dto";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Users]
 */
router.get("/", authorize(Role.ADMIN), usersController.list);

/**
 * @openapi
 * /api/users/{id}/role:
 *   put:
 *     summary: Change a user's role (Admin only)
 *     tags: [Users]
 */
router.put("/:id/role", authorize(Role.ADMIN), validate(updateRoleSchema), usersController.updateRole);

export default router;
