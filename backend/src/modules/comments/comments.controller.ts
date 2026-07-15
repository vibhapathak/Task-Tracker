import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { commentsService } from "./comments.service";
import { CreateCommentDto } from "./comments.dto";

export const commentsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const comments = await commentsService.list(req.user!, req.params.id);
    res.status(200).json(comments);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { message } = req.body as CreateCommentDto;
    const comment = await commentsService.create(req.user!, req.params.id, message);
    res.status(201).json(comment);
  }),
};
