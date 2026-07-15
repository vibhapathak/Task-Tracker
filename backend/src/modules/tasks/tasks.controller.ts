import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { tasksService } from "./tasks.service";
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from "./tasks.dto";
import { ApiError } from "../../utils/ApiError";

export const tasksController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as TaskQueryDto;
    const result = await tasksService.listTasks(req.user!, query);
    res.status(200).json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const task = await tasksService.getTaskById(req.user!, req.params.id);
    res.status(200).json(task);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as CreateTaskDto;
    const task = await tasksService.createTask(req.user!, dto);
    res.status(201).json(task);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as UpdateTaskDto;
    const task = await tasksService.updateTask(req.user!, req.params.id, dto);
    res.status(200).json(task);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await tasksService.deleteTask(req.params.id);
    res.status(204).send();
  }),
};
