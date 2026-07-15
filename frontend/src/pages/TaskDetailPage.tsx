import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tasksApi } from "../api/tasks";
import { commentsApi, usersApi } from "../api/comments-users";
import { Comment, Task, TaskStatus, User } from "../types";
import { PriorityBadge, StatusBadge } from "../components/Badges";
import { TaskFormModal } from "../components/TaskFormModal";
import { extractErrorMessage } from "../api/client";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = user?.role === "MANAGER" || user?.role === "ADMIN";

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [taskData, commentsData] = await Promise.all([
        tasksApi.getById(id),
        commentsApi.list(id),
      ]);
      setTask(taskData);
      setComments(commentsData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (canManage) usersApi.list().then(setUsers).catch(() => setUsers([]));
  }, [canManage]);

  async function handleStatusChange(status: TaskStatus) {
    if (!task) return;
    try {
      const updated = await tasksApi.update(task.id, { status });
      setTask(updated);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    setPostingComment(true);
    try {
      const comment = await commentsApi.create(id, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      alert(extractErrorMessage(err));
    } finally {
      setPostingComment(false);
    }
  }

  async function handleDelete() {
    if (!task || !confirm("Delete this task? This cannot be undone.")) return;
    try {
      await tasksApi.remove(task.id);
      navigate("/tasks");
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 text-slate-400">Loading...</div>;

  if (error || !task) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error ?? "Task not found"}
        </div>
        <Link to="/tasks" className="text-brand-600 hover:underline text-sm mt-4 inline-block">
          ← Back to tasks
        </Link>
      </div>
    );
  }

  // A Member can only change status; Manager/Admin can edit everything.
  const isAssignedMember = user?.role === "MEMBER" && task.assignedToId === user.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/tasks" className="text-sm text-brand-600 hover:underline">
        ← Back to tasks
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{task.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          {canManage && (
            <div className="flex gap-3 shrink-0">
              <button onClick={() => setEditing(true)} className="text-sm text-brand-600 font-medium hover:underline">
                Edit
              </button>
              <button onClick={handleDelete} className="text-sm text-red-600 font-medium hover:underline">
                Delete
              </button>
            </div>
          )}
        </div>

        {task.description && <p className="text-slate-600 mt-4 whitespace-pre-wrap">{task.description}</p>}

        <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-slate-400">Created by</dt>
            <dd className="text-slate-700">{task.createdBy.name}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Assigned to</dt>
            <dd className="text-slate-700">{task.assignedTo?.name ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Due date</dt>
            <dd className="text-slate-700">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Last updated</dt>
            <dd className="text-slate-700">{new Date(task.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>

        {(isAssignedMember || canManage) && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">Update status</label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <h2 className="font-semibold text-slate-900 mb-4">Comments</h2>

        <div className="space-y-4">
          {comments.length === 0 && <p className="text-sm text-slate-400">No comments yet.</p>}
          {comments.map((c) => (
            <div key={c.id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-slate-800">{c.createdBy.name}</span>
                <span className="text-slate-400 text-xs">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{c.message}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="mt-6 flex gap-3">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={postingComment || !newComment.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md disabled:opacity-60"
          >
            Post
          </button>
        </form>
      </div>

      {editing && (
        <TaskFormModal
          task={task}
          users={users}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            load();
          }}
        />
      )}
    </div>
  );
}
