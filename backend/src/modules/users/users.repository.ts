import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export const usersRepository = {
  findAll() {
    return prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  },

  updateRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: publicUserSelect,
    });
  },
};
