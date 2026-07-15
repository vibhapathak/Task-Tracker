export type Role = "ADMIN" | "MANAGER" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  assignedToId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  message: string;
  taskId: string;
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
}

export interface PaginatedTasks {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
