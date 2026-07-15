import { Role } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import { usersRepository } from "./users.repository";

export const usersService = {
  async listUsers() {
    return usersRepository.findAll();
  },

  async updateRole(userId: string, role: Role) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return usersRepository.updateRole(userId, role);
  },
};
