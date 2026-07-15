import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tasksApi, TaskFiltersParams } from "../api/tasks";
import { usersApi } from "../api/comments-users";
import { PaginatedTasks, Task, User } from "../types";
import { PriorityBadge, StatusBadge } from "../components/Badges";
import { TaskFormModal } from "../components/TaskFormModal";
import { extractErrorMessage } from "../api/client";

export function TasksListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canManage = user?.role === "MANAGER" || user?.role === "ADMIN";

  const [result, setResult] = useState<PaginatedTasks | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalTask, setModalTask] = useState<Task | null | undefined>(undefined);

  const filters: TaskFiltersParams = {
    status: (searchParams.get("status") as TaskFiltersParams["status"]) || undefined,
    priority: (searchParams.get("priority") as TaskFiltersParams["priority"]) || undefined,
    assignedTo: searchParams.get("assignedTo") || undefined,
    search: searchParams.get("search") || undefined,
    page: Number(searchParams.get("page") || 1),
    pageSize: 10,
  };

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.list(filters);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (canManage) {
      usersApi.list().then(setUsers).catch(() => setUsers([]));
    }
  }, [canManage]);

  useEffect(() => {
    if (searchParams.get("new") === "1" && canManage) {
      setModalTask(null);
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    try {
      await tasksApi.remove(id);
      loadTasks();
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
        {canManage && (
          <button
            onClick={() => setModalTask(null)}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md"
          >
            + New task
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <select
          value={filters.status ?? ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={filters.priority ?? ""}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {canManage && (
          <select
            value={filters.assignedTo ?? ""}
            onChange={(e) => updateFilter("assignedTo", e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="">Anyone assigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="search"
          placeholder="Search title or description..."
          defaultValue={filters.search ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateFilter("search", (e.target as HTMLInputElement).value);
          }}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm flex-1 min-w-[200px]"
        />
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Assigned to</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading tasks...
                </td>
              </tr>
            )}
            {!loading && result?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No tasks found.
                </td>
              </tr>
            )}
            {!loading &&
              result?.items.map((task) => (
                <tr key={task.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/tasks/${task.id}`} className="font-medium text-brand-700 hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{task.assignedTo?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    {canManage && (
                      <>
                        <button
                          onClick={() => setModalTask(task)}
                          className="text-brand-600 hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {result && result.total > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>
            Page {result.page} of {totalPages} ({result.total} task{result.total === 1 ? "" : "s"})
          </span>
          <div className="flex gap-2">
            <button
              disabled={result.page <= 1}
              onClick={() => updateFilter("page", String(result.page - 1))}
              className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={result.page >= totalPages}
              onClick={() => updateFilter("page", String(result.page + 1))}
              className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modalTask !== undefined && (
        <TaskFormModal
          task={modalTask}
          users={users}
          onClose={() => setModalTask(undefined)}
          onSaved={() => {
            setModalTask(undefined);
            loadTasks();
          }}
        />
      )}
    </div>
  );
}
