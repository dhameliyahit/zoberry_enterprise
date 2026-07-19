"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { orderService } from "@/services/order.service";
import { authService } from "@/services/auth.service";
import Breadcrumb from "@/components/Common/Breadcrumb";
import UpiQrPayment from "@/components/Checkout/UpiQrPayment";

type OrderData = {
  _id: string;
  orderNumber: string;
  items: { title: string; image?: string; price: number; quantity: number }[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  billedAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
};

const fmt = (n: number) => (n ?? 0).toLocaleString("en-IN");

/* ─── Reusable: order summary card ────────────────────────── */
function OrderSummary({ order, amount }: { order: OrderData; amount: number }) {
  return (
    <div className="lg:max-w-[455px] w-full">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Order Summary</h3>
        </div>
        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          <div className="space-y-5">
            {order.items?.map((item, key) => (
              <div key={key} className="flex items-center justify-between border-b border-gray-3 pb-5">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-10 h-10 rounded-md object-cover border border-gray-3" />
                  )}
                  <p className="text-dark">
                    {item.title} <span className="text-dark-4">×{item.quantity}</span>
                  </p>
                </div>
                <p className="font-medium text-dark whitespace-nowrap">₹{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between text-[13px] text-dark-3">
              <span>Subtotal</span><span>₹{fmt(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-dark-3">
              <span>Shipping Cost</span><span>₹{fmt(order.shippingCost)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-dark-3">
              <span>Estimated Tax (5%)</span><span>₹{fmt(order.tax)}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-3 text-lg font-medium text-dark">
              <span>Total</span><span className="text-blue">₹{fmt(order.total)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-blue-light-5 border border-blue-light-2 p-5 text-center">
            <p className="text-[11px] font-medium text-dark-4 uppercase tracking-wide">Amount to Pay</p>
            <p className="text-[40px] font-bold text-dark tracking-tight leading-none mt-1.5">₹{fmt(amount)}</p>
            <p className="text-[12px] text-dark-3 mt-2.5 leading-relaxed">
              Pay this exact amount.<br />Do not round the amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable: state card ────────────────────────────────── */
function StateCard({
  title, sub, actionLabel, actionHref, tone = "red",
}: { title: string; sub: string; actionLabel: string; actionHref: string; tone?: "red" | "green" }) {
  const toneBg = tone === "green" ? "bg-green-light-6 text-green-dark" : "bg-red-light-6 text-red";
  return (
    <div className="max-w-[600px] w-full bg-white shadow-1 rounded-[10px] p-8 text-center">
      <div className={`mx-auto w-16 h-16 ${toneBg} flex items-center justify-center rounded-full mb-6 text-2xl`}>
        {tone === "green" ? "✓" : "✕"}
      </div>
      <h2 className="font-semibold text-2xl text-dark mb-2">{title}</h2>
      <p className="text-dark-3 mb-7">{sub}</p>
      <a href={actionHref} className="inline-block font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark transition-colors">
        {actionLabel}
      </a>
    </div>
  );
}

export default function PayPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [vpa, setVpa] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = authService.getToken();
        if (!token) { router.push("/signin"); return; }

        const existingOrderRes = await fetch(`/api/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } });
        const ordersData = await existingOrderRes.json();
        const foundOrder = ordersData?.data?.find((o: any) => o._id === orderId);

        if (!foundOrder) { setError("Order not found"); setLoading(false); return; }
        if (foundOrder.paymentMethod !== "directupi") { setError("This order does not use UPI payment"); setLoading(false); return; }

        const configRes = await orderService.getPaymentConfig();
        setVpa(configRes?.data?.providers?.directupi?.vpa || "heetdhameliya59-2@oksbi");
        setOrder(foundOrder as OrderData);
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Failed to load payment details");
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, router]);

  const orderNo = order ? (order.orderNumber || `ZOB-${order._id.slice(-5).toUpperCase()}`) : "";
  const amount = order ? (order.billedAmount || order.total) : 0;

  if (loading) {
    return (
      <>
        <Breadcrumb title="Payment" pages={["Payment"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 text-center">
            <div className="h-8 w-8 border-4 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-dark-3">Loading payment details…</p>
          </div>
        </section>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Breadcrumb title="Payment" pages={["Payment"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 flex justify-center">
            <StateCard title="Unable to Load Payment" sub={error} actionLabel="Return to Checkout" actionHref="/checkout" />
          </div>
        </section>
      </>
    );
  }

  if (order.paymentStatus === "paid") {
    return (
      <>
        <Breadcrumb title="Payment" pages={["Payment"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 flex justify-center">
            <StateCard
              tone="green"
              title="Payment Already Received"
              sub={`Order ${orderNo} has been confirmed and paid.`}
              actionLabel="View Order"
              actionHref="/my-account/orders"
            />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Complete Your Payment" pages={["Payment"]} />
      <section className="py-10 sm:py-15 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <p className="text-[13px] text-dark-3 mb-7">
            Order <span className="font-semibold text-blue">{orderNo}</span> is ready. Scan the QR or open your UPI app to pay{" "}
            <span className="font-semibold text-dark">₹{fmt(amount)}</span> and confirm.
          </p>

          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11 items-start">
            <div className="lg:flex-1 w-full min-w-0">
              <UpiQrPayment
                orderId={order._id}
                orderNumber={orderNo}
                amount={amount}
                vpa={vpa}
                onSuccess={() => router.push("/my-account/orders")}
                onFailed={(reason) =>
                  setError(
                    reason === "amount_mismatch"
                      ? "The amount you paid didn't match the exact billed amount. Please contact support."
                      : "We couldn't confirm your payment within the 10-minute window. Please contact support."
                  )
                }
              />
            </div>
            <div className="w-full lg:w-[420px] xl:w-[460px] lg:sticky lg:top-6 lg:self-start">
              <OrderSummary order={order} amount={amount} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
