import { get, post, put, del } from "./api";
import type { ApiResponse, PaginatedResponse, Product } from "@/types";

export interface ProductFilters {
  category?: string;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  getAll: (filters?: ProductFilters) =>
    get<PaginatedResponse<Product>>("/products", filters as Record<string, any>),

  getBySlug: (slug: string) =>
    get<ApiResponse<Product>>(`/products/slug/${slug}`),

  getById: (id: string) =>
    get<ApiResponse<Product>>(`/products/${id}`),

  create: (data: FormData) =>
    post<ApiResponse<Product>>("/products", data),

  update: (id: string, data: FormData) =>
    put<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) =>
    del<ApiResponse<null>>(`/products/${id}`),
};
