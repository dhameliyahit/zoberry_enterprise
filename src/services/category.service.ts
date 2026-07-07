import { post, put, del } from "./api";
import { getFromSiteApi } from "./site-api";
import type { ApiResponse, Category } from "@/types";

export const categoryService = {
  getAll: (isActive?: boolean) =>
    getFromSiteApi<ApiResponse<Category[]>>(
      "/categories",
      isActive !== undefined ? { isActive } : undefined
    ),

  getById: (id: string) => getFromSiteApi<ApiResponse<Category>>(`/categories/${id}`),

  getBySlug: (slug: string) => getFromSiteApi<ApiResponse<Category>>(`/categories/slug/${slug}`),

  create: (data: FormData) => post<ApiResponse<Category>>("/categories", data),

  update: (id: string, data: FormData) => put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) => del<ApiResponse<null>>(`/categories/${id}`),
};
