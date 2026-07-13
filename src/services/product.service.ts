import { post, put, del } from "./api";
import { getFromSiteApi, postToSiteApi } from "./site-api";
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

const normalizeImages = (product: any): any => {
  if (!product) return product;
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map((img: any) =>
      typeof img === "string" ? img : img.url || img
    );
  }
  if (product.variants) {
    product.variants = product.variants.map((v: any) => ({
      ...v,
      option1: v.option1 || null,
      option2: v.option2 || null,
      option3: v.option3 || null,
    }));
  }
  return product;
};

const normalizeList = (data: any[]): any[] => (data || []).map(normalizeImages);

export const productService = {
  getAll: async (filters?: ProductFilters) => {
    const res = await getFromSiteApi<PaginatedResponse<Product>>(
      "/products",
      filters as Record<string, any>
    );
    if (res.data) res.data = normalizeList(res.data);
    return res;
  },

  getBySlug: async (slug: string) => {
    const res = await getFromSiteApi<ApiResponse<Product>>(`/products/slug/${slug}`);
    if (res.data) res.data = normalizeImages(res.data);
    return res;
  },

  getById: async (id: string) => {
    const res = await getFromSiteApi<ApiResponse<Product>>(`/products/${id}`);
    if (res.data) res.data = normalizeImages(res.data);
    return res;
  },

  create: (data: FormData) => post<ApiResponse<Product>>("/products", data),

  update: (id: string, data: FormData) => put<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) => del<ApiResponse<null>>(`/products/${id}`),

  addReview: (id: string, data: { name?: string; email?: string; rating: number; comment: string }) =>
    postToSiteApi<ApiResponse<Product>>(`/products/${id}/reviews`, data),
};
