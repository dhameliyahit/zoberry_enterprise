import { get, post, put, del } from "./api";
import type { ApiResponse, PaginatedResponse, BlogItem } from "@/types";

export interface BlogFilters {
  category?: string;
  page?: number;
  limit?: number;
}

export const blogService = {
  getAll: (filters?: BlogFilters) =>
    get<PaginatedResponse<BlogItem>>("/blogs", filters),

  getBySlug: (slug: string) =>
    get<ApiResponse<BlogItem>>(`/blogs/slug/${slug}`),

  getById: (id: string) =>
    get<ApiResponse<BlogItem>>(`/blogs/${id}`),

  create: (data: FormData) =>
    post<ApiResponse<BlogItem>>("/blogs", data),

  update: (id: string, data: FormData) =>
    put<ApiResponse<BlogItem>>(`/blogs/${id}`, data),

  delete: (id: string) =>
    del<ApiResponse<null>>(`/blogs/${id}`),
};
