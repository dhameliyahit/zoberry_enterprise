import { get, post, patch, del } from "./api";
import type { ApiResponse, Contact } from "@/types";

export const contactService = {
  create: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    post<ApiResponse<Contact>>("/contact", data),

  getAll: (filters?: { isRead?: boolean; page?: number; limit?: number }) =>
    get<ApiResponse<Contact[]>>("/contact", filters),

  getById: (id: string) =>
    get<ApiResponse<Contact>>(`/contact/${id}`),

  markRead: (id: string) =>
    patch<ApiResponse<Contact>>(`/contact/${id}/read`),

  delete: (id: string) =>
    del<ApiResponse<null>>(`/contact/${id}`),
};
