import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: { name: string; email: string; passwordHash: string; role?: Role }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? Role.MEMBER,
      },
    });
  },
};
