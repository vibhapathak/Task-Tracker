import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { usersService } from "./users.service";
import { UpdateRoleDto } from "./users.dto";

export const usersController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const users = await usersService.listUsers();
    res.status(200).json(users);
  }),

  updateRole: asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.body as UpdateRoleDto;
    const user = await usersService.updateRole(req.params.id, role);
    res.status(200).json(user);
  }),
};
