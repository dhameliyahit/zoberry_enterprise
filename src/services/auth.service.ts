import { post, get } from "./api";
import type { ApiResponse, LoginResponse, User } from "@/types";

export const authService = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    post<LoginResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    post<LoginResponse>("/auth/login", data),

  adminLogin: (data: { email: string; password: string }) =>
    post<LoginResponse>("/auth/admin-login", data),

  googleLogin: (token: string) =>
    post<LoginResponse>("/auth/google-login", { token }),

  getMe: () => get<ApiResponse<User>>("/auth/me"),

  setToken: (token: string) => {
    localStorage.setItem("zoberry_token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("zoberry_token");
  },

  logout: () => {
    localStorage.removeItem("zoberry_token");
    localStorage.removeItem("zoberry_user");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("zoberry_token");
  },
};
