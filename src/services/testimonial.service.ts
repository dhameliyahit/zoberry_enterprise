import { get, post, put, del } from "./api";
import type { ApiResponse, Testimonial } from "@/types";

export const testimonialService = {
  getAll: (isActive?: boolean) =>
    get<ApiResponse<Testimonial[]>>("/testimonials", isActive !== undefined ? { isActive } : undefined),

  getById: (id: string) =>
    get<ApiResponse<Testimonial>>(`/testimonials/${id}`),

  create: (data: FormData) =>
    post<ApiResponse<Testimonial>>("/testimonials", data),

  update: (id: string, data: FormData) =>
    put<ApiResponse<Testimonial>>(`/testimonials/${id}`, data),

  delete: (id: string) =>
    del<ApiResponse<null>>(`/testimonials/${id}`),
};
