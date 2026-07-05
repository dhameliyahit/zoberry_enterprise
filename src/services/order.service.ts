import { getFromSiteApi, postToSiteApi, putToSiteApi } from "./site-api";
import type { ApiResponse, Order } from "@/types";

export const orderService = {
  getMyOrders: () =>
    getFromSiteApi<ApiResponse<Order[]>>("/orders/my-orders"),

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
    postToSiteApi<ApiResponse<Order>>("/orders", data),

  cancel: (id: string) =>
    putToSiteApi<ApiResponse<Order>>(`/orders/${id}/cancel`),
};
