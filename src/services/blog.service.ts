import { getFromSiteApi } from "./site-api";
import type { ApiResponse, PaginatedResponse, BlogItem } from "@/types";

export type BlogFilters = {
  category?: string;
  page?: number;
  limit?: number;
};

export const blogService = {
  getAll: (filters?: BlogFilters) =>
    getFromSiteApi<PaginatedResponse<BlogItem>>(
      "/blogs",
      filters as Record<string, string | number | boolean | undefined | null> | undefined
    ),

  getBySlug: (slug: string) =>
    getFromSiteApi<ApiResponse<BlogItem>>(`/blogs/slug/${slug}`),

  getById: (id: string) =>
    getFromSiteApi<ApiResponse<BlogItem>>(`/blogs/${id}`),
};
