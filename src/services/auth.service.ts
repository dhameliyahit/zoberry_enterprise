import { deleteFromSiteApi, getFromSiteApi, postToSiteApi } from "./site-api";
import type { ApiResponse, LoginResponse, User } from "@/types";

export const authService = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    postToSiteApi<LoginResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    postToSiteApi<LoginResponse>("/auth/login", data),

  adminLogin: (data: { email: string; password: string }) =>
    postToSiteApi<LoginResponse>("/auth/admin-login", data),

  googleLogin: (token: string) =>
    postToSiteApi<LoginResponse>("/auth/google-login", { token }),

  getMe: () => getFromSiteApi<ApiResponse<User>>("/auth/me"),

  addAddress: (data: any) =>
    postToSiteApi<ApiResponse<any>>("/users/addresses", data),

  deleteAddress: (addressId: string) =>
    deleteFromSiteApi<ApiResponse<any>>(`/users/addresses/${addressId}`),

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
