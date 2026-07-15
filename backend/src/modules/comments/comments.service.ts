import { Role } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import { AuthPayload } from "../../middleware/auth";
import { tasksRepository } from "../tasks/tasks.repository";
import { commentsRepository } from "./comments.repository";

async function assertTaskVisible(actor: AuthPayload, taskId: string) {
  const task = await tasksRepository.findById(taskId);
  if (!task) {
    throw ApiError.notFound("Task not found");
  }
  // Members may only see/comment on tasks assigned to them; Manager/Admin
  // can see and comment on any task.
  if (actor.role === Role.MEMBER && task.assignedToId !== actor.userId) {
    throw ApiError.forbidden("You can only comment on tasks assigned to you");
  }
  return task;
}

export const commentsService = {
  async list(actor: AuthPayload, taskId: string) {
    await assertTaskVisible(actor, taskId);
    return commentsRepository.findByTask(taskId);
  },

  async create(actor: AuthPayload, taskId: string, message: string) {
    await assertTaskVisible(actor, taskId);
    return commentsRepository.create({ message, taskId, createdById: actor.userId });
  },
};
