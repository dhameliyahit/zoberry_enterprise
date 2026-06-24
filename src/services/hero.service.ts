import { get, post, put, del } from "./api";
import type { ApiResponse, HeroSlide } from "@/types";

export const heroService = {
  getAll: (isActive?: boolean) =>
    get<ApiResponse<HeroSlide[]>>("/hero-slides", isActive !== undefined ? { isActive } : undefined),

  getById: (id: string) =>
    get<ApiResponse<HeroSlide>>(`/hero-slides/${id}`),

  create: (data: FormData) =>
    post<ApiResponse<HeroSlide>>("/hero-slides", data),

  update: (id: string, data: FormData) =>
    put<ApiResponse<HeroSlide>>(`/hero-slides/${id}`, data),

  delete: (id: string) =>
    del<ApiResponse<null>>(`/hero-slides/${id}`),
};
