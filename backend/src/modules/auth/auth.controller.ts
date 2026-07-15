import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { LoginDto, SignupDto } from "./auth.dto";

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as SignupDto;
    const result = await authService.signup(dto);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as LoginDto;
    const result = await authService.login(dto);
    res.status(200).json(result);
  }),
};
