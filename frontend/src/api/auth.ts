import { api } from "./client";
import { AuthResponse } from "../types";

export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("/auth/signup", data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
};
