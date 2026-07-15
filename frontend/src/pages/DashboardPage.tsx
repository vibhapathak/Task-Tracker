import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tasksApi } from "../api/tasks";
import { PaginatedTasks } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PaginatedTasks | null>(null);

  useEffect(() => {
    tasksApi.list({ page: 1, pageSize: 1 }).then(setSummary).catch(() => setSummary(null));
  }, []);

  if (!user) return null;

  const roleCopy: Record<string, string> = {
    ADMIN: "You can manage users, view every task, and edit anything.",
    MANAGER: "You can create tasks and assign them to your team.",
    MEMBER: "You can see what's assigned to you and keep it moving.",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Hi, {user.name.split(" ")[0]} 👋</h1>
      <p className="text-slate-500 mt-1">{roleCopy[user.role]}</p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">
            {user.role === "MEMBER" ? "Tasks assigned to you" : "Total tasks in the system"}
          </p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">
            {summary ? summary.total : "—"}
          </p>
          <Link to="/tasks" className="text-sm text-brand-600 font-medium hover:underline mt-3 inline-block">
            View task list →
          </Link>
        </div>

        {(user.role === "MANAGER" || user.role === "ADMIN") && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Quick action</p>
            <p className="text-lg font-medium text-slate-900 mt-1">Create a new task</p>
            <Link
              to="/tasks?new=1"
              className="text-sm text-brand-600 font-medium hover:underline mt-3 inline-block"
            >
              Open the task form →
            </Link>
          </div>
        )}

        {user.role === "ADMIN" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Administration</p>
            <p className="text-lg font-medium text-slate-900 mt-1">Manage users & roles</p>
            <Link to="/users" className="text-sm text-brand-600 font-medium hover:underline mt-3 inline-block">
              Go to user management →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
