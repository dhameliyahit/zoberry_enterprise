import { getFromSiteApi } from "./site-api";
import type { ApiResponse, Testimonial } from "@/types";

export const testimonialService = {
  getAll: (isActive?: boolean) =>
    getFromSiteApi<ApiResponse<Testimonial[]>>("/testimonials", isActive !== undefined ? { isActive } : undefined),

  getById: (id: string) =>
    getFromSiteApi<ApiResponse<Testimonial>>(`/testimonials/${id}`),
};
