import { api } from "./client";
import { Comment, Role, User } from "../types";

export const commentsApi = {
  list: (taskId: string) => api.get<Comment[]>(`/tasks/${taskId}/comments`).then((r) => r.data),
  create: (taskId: string, message: string) =>
    api.post<Comment>(`/tasks/${taskId}/comments`, { message }).then((r) => r.data),
};

export const usersApi = {
  list: () => api.get<User[]>("/users").then((r) => r.data),
  updateRole: (id: string, role: Role) =>
    api.put<User>(`/users/${id}/role`, { role }).then((r) => r.data),
};
