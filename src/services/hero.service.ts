import { getFromSiteApi } from "./site-api";
import type { ApiResponse, HeroSlide } from "@/types";

export const heroService = {
  getAll: (isActive?: boolean) =>
    getFromSiteApi<ApiResponse<HeroSlide[]>>("/hero-slides", isActive !== undefined ? { isActive } : undefined),

  getById: (id: string) =>
    getFromSiteApi<ApiResponse<HeroSlide>>(`/hero-slides/${id}`),
};
