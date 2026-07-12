"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface OrderDetailsProps {
  orderItem: any;
}

const OrderDetails = ({ orderItem }: OrderDetailsProps) => {
  const router = useRouter();
  const steps = [
    { label: "Placed", key: "pending" },
    { label: "Confirmed", key: "confirmed" },
    { label: "Processing", key: "processing" },
    { label: "Shipped", key: "shipped" },
    { label: "Delivered", key: "delivered" },
  ];

  const currentStatusIndex = steps.findIndex((step) => step.key === orderItem.status);
  const isCancelled = orderItem.status === "cancelled";

  const handlePrint = () => {
    // We can print this specific invoice
    window.print();
  };

  const formattedDate = orderItem.createdAt
    ? new Date(orderItem.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="space-y-8 print:p-0">
      {orderItem.paymentMethod === "uropay" && orderItem.paymentStatus !== "paid" && (
        <div className="mb-6 p-4 rounded-xl border border-blue/10 bg-blue-light-6 text-center">
          <p className="text-sm text-dark mb-3">
            Your UPI payment is pending. Complete it now to confirm your order.
          </p>
          <button
            onClick={() => router.push(`/pay/${orderItem._id}`)}
            className="rounded-lg bg-blue py-2.5 px-6 font-medium text-white hover:bg-blue-dark transition-colors"
          >
            Complete UPI Payment
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-3 pb-6 print:border-b-2">
        <div>
          <h2 className="text-2xl font-bold text-dark print:text-xl">
            Invoice details
          </h2>
          <p className="text-sm text-dark-4 mt-1">
            Order ID:{" "}
            <span className="font-semibold text-dark">
              {orderItem.orderNumber || `#${orderItem._id.slice(-8).toUpperCase()}`}
            </span>
          </p>
          <p className="text-xs text-dark-4 mt-0.5">Placed on: {formattedDate}</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 border border-gray-3 hover:border-dark font-medium text-xs py-2 px-4 rounded-md transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Invoice
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      {!isCancelled ? (
        <div className="bg-gray-1 p-6 rounded-xl border border-gray-3 print:hidden">
          <h3 className="font-semibold text-sm text-dark mb-6">Order Status Timeline</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2">
            {steps.map((step, index) => {
              const completed = index <= currentStatusIndex;
              const active = index === currentStatusIndex;
              return (
                <div key={index} className="flex flex-row sm:flex-col items-center flex-1 w-full sm:w-auto">
                  {/* Step circle */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      completed
                        ? "bg-blue border-blue text-white shadow-md"
                        : "bg-white border-gray-4 text-dark-4"
                    } ${active ? "ring-4 ring-blue/20" : ""}`}
                  >
                    {completed ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Step text */}
                  <div className="ml-4 sm:ml-0 sm:mt-2.5 text-left sm:text-center">
                    <p className={`text-xs font-semibold capitalize ${completed ? "text-dark" : "text-dark-4"}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-light-6 p-4 rounded-xl border border-red/10 text-red text-sm font-semibold flex items-center gap-2 print:hidden">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          This order was cancelled.
        </div>
      )}

      {/* Items Section */}
      <div>
        <h3 className="font-semibold text-lg text-dark mb-4">Ordered Items</h3>
        <div className="border border-gray-3 rounded-xl overflow-hidden print:border-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-1 border-b border-gray-3 text-xs font-bold text-dark uppercase print:bg-transparent">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4 text-center">Price</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderItem.items?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-3 text-sm text-dark last:border-none">
                  <td className="py-4 px-4 flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-md border border-gray-3 print:hidden"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.title}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">₹{item.price}</td>
                  <td className="py-4 px-4 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-right font-medium">
                    ₹{item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping details and totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        {/* Shipping Address Card */}
        <div className="border border-gray-3 rounded-xl p-5 bg-gray-1 bg-opacity-30 print:border-2">
          <h4 className="font-semibold text-sm text-dark mb-3">Delivery address</h4>
          {orderItem.shippingAddress ? (
            <div className="space-y-1.5 text-sm text-dark-4">
              <p className="font-bold text-dark">{orderItem.shippingAddress.fullName}</p>
              <p>{orderItem.shippingAddress.street}</p>
              <p>
                {orderItem.shippingAddress.city}, {orderItem.shippingAddress.state} -{" "}
                {orderItem.shippingAddress.zip}
              </p>
              <p>{orderItem.shippingAddress.country}</p>
              <p className="pt-2 font-medium text-dark">
                Phone: {orderItem.shippingAddress.phone}
              </p>
            </div>
          ) : (
            <p className="text-sm text-dark-4">No delivery address specified.</p>
          )}
        </div>

        {/* Totals and payment details card */}
        <div className="border border-gray-3 rounded-xl p-5 bg-gray-1 bg-opacity-30 print:border-2">
          <h4 className="font-semibold text-sm text-dark mb-3">Payment details</h4>
          <div className="space-y-2 text-sm text-dark-4 border-b border-gray-3 pb-3">
            <div className="flex justify-between">
              <span>Payment method</span>
              <span className="font-semibold text-dark uppercase">
                {orderItem.paymentMethod === "cod"
                  ? "Cash on delivery"
                  : orderItem.paymentMethod === "netbanking"
                  ? "Bank Transfer"
                  : orderItem.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment status</span>
              <span
                className={`font-semibold capitalize ${
                  orderItem.paymentStatus === "paid" ? "text-green" : "text-orange-500"
                }`}
              >
                {orderItem.paymentStatus}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-dark-4 pt-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{orderItem.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping cost</span>
              <span>₹{orderItem.shippingCost}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (5%)</span>
              <span>₹{orderItem.tax}</span>
            </div>
            <div className="flex justify-between text-dark font-bold text-base pt-2 border-t border-gray-3">
              <span>Grand Total</span>
              <span className="text-blue">₹{orderItem.total}</span>
            </div>
          </div>
        </div>
      </div>

      {orderItem.notes && (
        <div className="border border-gray-3 rounded-xl p-5 bg-gray-1 bg-opacity-30 print:border-2">
          <h4 className="font-semibold text-sm text-dark mb-2">Order Notes</h4>
          <p className="text-sm text-dark-4 italic">&ldquo;{orderItem.notes}&rdquo;</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
