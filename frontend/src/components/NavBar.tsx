import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-brand-600 text-lg">Task Tracker</span>
          <div className="hidden sm:flex items-center gap-1 ml-6">
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/tasks" label="Tasks" />
            {user.role === "ADMIN" && <NavItem to="/users" label="Users" />}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {user.name} <span className="text-slate-400">({user.role})</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
      <div className="sm:hidden flex gap-1 px-4 pb-2">
        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/tasks" label="Tasks" />
        {user.role === "ADMIN" && <NavItem to="/users" label="Users" />}
      </div>
    </nav>
  );
}
