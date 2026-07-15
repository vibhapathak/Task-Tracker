import { api } from "./client";
import { PaginatedTasks, Task, TaskPriority, TaskStatus } from "../types";

export interface TaskFiltersParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assignedToId?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export const tasksApi = {
  list: (params: TaskFiltersParams) =>
    api.get<PaginatedTasks>("/tasks", { params }).then((r) => r.data),

  getById: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),

  create: (payload: CreateTaskPayload) => api.post<Task>("/tasks", payload).then((r) => r.data),

  update: (id: string, payload: UpdateTaskPayload) =>
    api.put<Task>(`/tasks/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/tasks/${id}`),
};
