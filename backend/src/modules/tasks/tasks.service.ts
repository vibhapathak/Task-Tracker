import { Prisma, Role } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import { AuthPayload } from "../../middleware/auth";
import { tasksRepository } from "./tasks.repository";
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from "./tasks.dto";

export const tasksService = {
  async listTasks(actor: AuthPayload, query: TaskQueryDto) {
    // Members only ever see tasks assigned to them, regardless of the
    // `assignedTo` filter they pass in. Manager/Admin see everything and
    // may optionally filter by assignee.
    const onlyVisibleToUserId = actor.role === Role.MEMBER ? actor.userId : undefined;
    const assignedToId = actor.role === Role.MEMBER ? undefined : query.assignedTo;

    return tasksRepository.findMany({
      status: query.status,
      priority: query.priority,
      assignedToId,
      onlyVisibleToUserId,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
    });
  },

  async getTaskById(actor: AuthPayload, taskId: string) {
    const task = await tasksRepository.findById(taskId);
    if (!task) {
      throw ApiError.notFound("Task not found");
    }
    if (actor.role === Role.MEMBER && task.assignedToId !== actor.userId) {
      throw ApiError.forbidden("You can only view tasks assigned to you");
    }
    return task;
  },

  async createTask(actor: AuthPayload, dto: CreateTaskDto) {
    // Route-level authorize() already restricts this to Manager/Admin.
    return tasksRepository.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      dueDate: dto.dueDate,
      createdById: actor.userId,
      assignedToId: dto.assignedToId,
    });
  },

  async updateTask(actor: AuthPayload, taskId: string, dto: UpdateTaskDto) {
    const existing = await tasksRepository.findById(taskId);
    if (!existing) {
      throw ApiError.notFound("Task not found");
    }

    if (actor.role === Role.MEMBER) {
      if (existing.assignedToId !== actor.userId) {
        throw ApiError.forbidden("You can only update tasks assigned to you");
      }
      // Members may only change the status field.
      const allowedKeys = Object.keys(dto);
      const disallowed = allowedKeys.filter((k) => k !== "status");
      if (disallowed.length > 0) {
        throw ApiError.forbidden(
          `Members can only update task status. Disallowed field(s): ${disallowed.join(", ")}`
        );
      }
      if (dto.status === undefined) {
        throw ApiError.badRequest("status is required");
      }
      return tasksRepository.update(taskId, { status: dto.status });
    }

    // Manager/Admin can update any field, including reassignment.
    const data: Prisma.TaskUpdateInput = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
    };
    if (dto.assignedToId !== undefined) {
      data.assignedTo = dto.assignedToId
        ? { connect: { id: dto.assignedToId } }
        : { disconnect: true };
    }

    return tasksRepository.update(taskId, data);
  },

  async deleteTask(taskId: string) {
    const existing = await tasksRepository.findById(taskId);
    if (!existing) {
      throw ApiError.notFound("Task not found");
    }
    await tasksRepository.delete(taskId);
  },
};
