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

  // UroPay (UPI gateway) flows
  getPaymentConfig: () => getFromSiteApi<ApiResponse<any>>("/config/payment"),
  createUroPay: (orderId: string) =>
    postToSiteApi<ApiResponse<any>>("/payments/uropay/create", { orderId }),
  submitUtr: (orderId: string, referenceNumber: string) =>
    postToSiteApi<ApiResponse<any>>("/payments/uropay/utr", {
      orderId,
      referenceNumber,
    }),
  getUroPayStatus: (uroPayOrderId: string) =>
    getFromSiteApi<ApiResponse<any>>(
      `/payments/uropay/status?uroPayOrderId=${encodeURIComponent(uroPayOrderId)}`
    ),

  // Static Direct UPI (QR scanned to merchant VPA) — manual UTR verification
  submitDirectUpiUtr: (orderId: string, referenceNumber: string) =>
    postToSiteApi<ApiResponse<any>>("/payments/directupi/utr", {
      orderId,
      referenceNumber,
    }),
};
