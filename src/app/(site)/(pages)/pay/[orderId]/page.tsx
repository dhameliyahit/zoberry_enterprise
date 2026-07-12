"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { orderService } from "@/services/order.service";
import { authService } from "@/services/auth.service";
import UroPayPayment from "@/components/Checkout/UroPayPayment";
import UpiQrPayment from "@/components/Checkout/UpiQrPayment";
import Image from "next/image";

export default function PayPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [vpa, setVpa] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          router.push("/signin");
          return;
        }

        const existingOrderRes = await fetch(`/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = await existingOrderRes.json();
        const foundOrder = ordersData?.data?.find((o: any) => o._id === orderId);

        if (!foundOrder) {
          setError("Order not found");
          setLoading(false);
          return;
        }

        if (foundOrder.paymentMethod === "uropay") {
          const res = await orderService.createUroPay(orderId);
          if (!res.success) {
            setError(res.error || "Payment not available");
            setLoading(false);
            return;
          }
          foundOrder.uroPayOrderId = res.data?.uroPayOrderId || foundOrder.uroPayOrderId;
        } else if (foundOrder.paymentMethod === "directupi") {
          const configRes = await orderService.getPaymentConfig();
          const vpaValue =
            configRes?.data?.providers?.directupi?.vpa || "heetdhameliya59-2@oksbi";
          setVpa(vpaValue);
        } else {
          setError("This order does not use UPI payment");
          setLoading(false);
          return;
        }

        setOrder(foundOrder);
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Failed to load payment details");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <section className="py-20 bg-gray-2 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-4">Loading payment details…</p>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="py-20 bg-gray-2 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-[600px] w-full bg-white shadow-xl rounded-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-light-6 text-red flex items-center justify-center rounded-full mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-semibold text-2xl text-dark mb-2">Unable to Load Payment</h2>
          <p className="text-dark-4 mb-6">{error}</p>
          <button
            onClick={() => router.push("/checkout")}
            className="rounded-lg bg-blue py-3 px-6 font-medium text-white hover:bg-blue-dark transition-colors"
          >
            Return to Checkout
          </button>
        </div>
      </section>
    );
  }

  const orderNo = order.orderNumber || `ZOB-${order._id.slice(-5).toUpperCase()}`;

  return (
    <section className="py-20 bg-gray-2 min-h-[70vh]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
          <div className="lg:max-w-[670px] w-full">
            <div className="bg-white shadow-1 rounded-[10px] p-6 sm:p-8.5 mb-7.5">
              <h2 className="font-medium text-dark text-xl sm:text-2xl mb-6">
                Complete Your Payment
              </h2>
              <p className="text-dark-4 mb-4">
                Order <span className="font-bold text-blue">{orderNo}</span> created.
                Please pay ₹{order.total} via UPI below.
              </p>
              {order.paymentMethod === "directupi" ? (
                <UpiQrPayment
                  orderId={order._id}
                  orderNumber={orderNo}
                  amount={order.total}
                  vpa={vpa}
                />
              ) : (
                <UroPayPayment
                  orderId={order._id}
                  orderNumber={orderNo}
                  amount={order.total}
                  uroPayOrderId={order.uroPayOrderId}
                />
              )}
            </div>
          </div>

          <div className="max-w-[455px] w-full">
            <div className="bg-white shadow-1 rounded-[10px]">
              <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                <h3 className="font-medium text-xl text-dark">Order Summary</h3>
              </div>
              <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                <div className="space-y-2">
                  {order.items?.map((item: any, key: number) => (
                    <div key={key} className="flex justify-between text-dark">
                      <span>
                        {item.title} <span className="text-dark-4">x{item.quantity}</span>
                      </span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-3 pt-3 space-y-2 text-sm text-dark-4 mt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Cost</span>
                    <span>₹{order.shippingCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (5%)</span>
                    <span>₹{order.tax}</span>
                  </div>
                  <div className="flex justify-between text-dark text-base font-bold pt-2 border-t border-gray-3">
                    <span>Total</span>
                    <span className="text-blue">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-7.5">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center font-medium border border-gray-4 hover:border-dark py-3 px-6 rounded-md ease-out duration-200"
              >
                Print Invoice
              </button>
              <button
                onClick={() => router.push("/my-account?tab=orders")}
                className="flex items-center justify-center font-medium text-white bg-blue hover:bg-blue-dark py-3 px-6 rounded-md ease-out duration-200"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
