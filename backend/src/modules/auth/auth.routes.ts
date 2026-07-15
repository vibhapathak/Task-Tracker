import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema, signupSchema } from "./auth.dto";

const router = Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user (always created as MEMBER)
 *     tags: [Auth]
 */
router.post("/signup", validate(signupSchema), authController.signup);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 */
router.post("/login", validate(loginSchema), authController.login);

export default router;
