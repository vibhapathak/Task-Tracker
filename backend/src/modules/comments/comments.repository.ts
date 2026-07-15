import { prisma } from "../../config/prisma";

export const commentsRepository = {
  findByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  create(data: { message: string; taskId: string; createdById: string }) {
    return prisma.comment.create({
      data,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
  },
};
