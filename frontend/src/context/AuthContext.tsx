import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { authApi } from "../api/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persist(authUser: User, token: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);
  }

  async function login(email: string, password: string) {
    const { token, user: authUser } = await authApi.login({ email, password });
    persist(authUser, token);
  }

  async function signup(name: string, email: string, password: string) {
    const { token, user: authUser } = await authApi.signup({ name, email, password });
    persist(authUser, token);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
