import { get, post, put, del } from "./api";
import type { ApiResponse, Category } from "@/types";

export const categoryService = {
  getAll: (isActive?: boolean) =>
    get<ApiResponse<Category[]>>("/categories", isActive !== undefined ? { isActive } : undefined),

  getById: (id: string) =>
    get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: FormData) =>
    post<ApiResponse<Category>>("/categories", data),

  update: (id: string, data: FormData) =>
    put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) =>
    del<ApiResponse<null>>(`/categories/${id}`),
};
