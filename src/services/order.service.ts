import { get, post, put, del } from "./api";
import type { ApiResponse, PaginatedResponse, Order } from "@/types";

export const orderService = {
  getAll: (filters?: { status?: string; paymentStatus?: string; page?: number; limit?: number }) =>
    get<PaginatedResponse<Order>>("/orders", filters),

  getMyOrders: () =>
    get<ApiResponse<Order[]>>("/orders/my-orders"),

  getById: (id: string) =>
    get<ApiResponse<Order>>(`/orders/${id}`),

  create: (data: {
    items: { product: string; title: string; image?: string; price: number; quantity: number }[];
    shippingAddress: any;
    subtotal: number;
    shippingCost?: number;
    tax?: number;
    total: number;
    paymentMethod?: string;
    notes?: string;
  }) =>
    post<ApiResponse<Order>>("/orders", data),

  update: (id: string, data: Partial<Order>) =>
    put<ApiResponse<Order>>(`/orders/${id}`, data),

  delete: (id: string) =>
    del<ApiResponse<null>>(`/orders/${id}`),
};
