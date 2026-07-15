import { TaskPriority, TaskStatus } from "../types";

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  DONE: "bg-emerald-100 text-emerald-800",
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-sky-100 text-sky-700",
  MEDIUM: "bg-violet-100 text-violet-700",
  HIGH: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyles[priority]}`}>
      {priority}
    </span>
  );
}
