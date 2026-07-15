import { z } from "zod";
import { Role } from "@prisma/client";

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}
