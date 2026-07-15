import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";

const taskInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
} satisfies Prisma.TaskInclude;

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  search?: string;
  // Restricts results to tasks visible to a specific member (assigned to them).
  onlyVisibleToUserId?: string;
  page: number;
  pageSize: number;
}

function buildWhere(filters: TaskFilters): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.onlyVisibleToUserId) where.assignedToId = filters.onlyVisibleToUserId;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export const tasksRepository = {
  async findMany(filters: TaskFilters) {
    const where = buildWhere(filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    return { items, total, page: filters.page, pageSize: filters.pageSize };
  },

  findById(id: string) {
    return prisma.task.findUnique({ where: { id }, include: taskInclude });
  },

  create(data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: Date;
    createdById: string;
    assignedToId?: string;
  }) {
    return prisma.task.create({ data, include: taskInclude });
  },

  update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ where: { id }, data, include: taskInclude });
  },

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },
};
