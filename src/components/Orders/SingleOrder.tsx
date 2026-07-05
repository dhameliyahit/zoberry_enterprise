"use client";
import React, { useState } from "react";
import OrderModal from "./OrderModal";
import { orderService } from "@/services/order.service";
import toast from "react-hot-toast";

interface SingleOrderProps {
  orderItem: any;
  smallView: boolean;
  onRefresh: () => void;
}

const SingleOrder = ({ orderItem, smallView, onRefresh }: SingleOrderProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setCancelling(true);
    try {
      const res = await orderService.cancel(orderItem._id);
      if (res.success) {
        toast.success("Order cancelled successfully!");
        onRefresh();
      } else {
        toast.error(res.error || "Failed to cancel order.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  // Summarize products title
  const getProductsSummary = () => {
    if (!orderItem.items || orderItem.items.length === 0) return "No items";
    const firstItem = orderItem.items[0].title;
    if (orderItem.items.length === 1) return firstItem;
    return `${firstItem} & ${orderItem.items.length - 1} more`;
  };

  const formattedDate = orderItem.createdAt
    ? new Date(orderItem.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const statusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green bg-green-light-6";
      case "cancelled":
        return "text-red bg-red-light-6";
      case "pending":
        return "text-orange-500 bg-orange-50";
      case "confirmed":
        return "text-blue bg-blue/10";
      case "processing":
      case "shipped":
        return "text-yellow bg-yellow-light-4";
      default:
        return "text-dark bg-gray-1";
    }
  };

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <p className="text-custom-sm font-semibold text-dark">
              {orderItem.orderNumber || `#${orderItem._id.slice(-8).toUpperCase()}`}
            </p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{formattedDate}</p>
          </div>

          <div className="min-w-[128px]">
            <p
              className={`inline-block text-custom-xs py-0.5 px-2.5 rounded-[30px] capitalize font-medium ${statusColor(
                orderItem.status
              )}`}
            >
              {orderItem.status}
            </p>
          </div>

          <div className="min-w-[213px] max-w-[250px] truncate">
            <p className="text-custom-sm text-dark" title={getProductsSummary()}>
              {getProductsSummary()}
            </p>
          </div>

          <div className="min-w-[113px]">
            <p className="text-custom-sm font-medium text-dark">₹{orderItem.total}</p>
          </div>

          <div className="flex gap-3 items-center min-w-[113px]">
            <button
              onClick={toggleDetails}
              className="text-custom-xs font-semibold text-blue bg-blue/5 hover:bg-blue hover:text-white py-1.5 px-3 rounded-md transition-all"
            >
              Details
            </button>
            {(orderItem.status === "pending" || orderItem.status === "confirmed") && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-custom-xs font-semibold text-red bg-red/5 hover:bg-red hover:text-white py-1.5 px-3 rounded-md transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden border-t border-gray-3 py-4.5 px-7.5 bg-white">
          <div className="flex justify-between items-center mb-2">
            <p className="text-custom-sm font-semibold text-dark">
              {orderItem.orderNumber || `#${orderItem._id.slice(-8).toUpperCase()}`}
            </p>
            <p
              className={`inline-block text-custom-xs py-0.5 px-2.5 rounded-[30px] capitalize font-medium ${statusColor(
                orderItem.status
              )}`}
            >
              {orderItem.status}
            </p>
          </div>
          <div className="space-y-1 text-xs text-dark-4">
            <p>
              <span className="font-medium pr-1">Date:</span> {formattedDate}
            </p>
            <p>
              <span className="font-medium pr-1">Products:</span> {getProductsSummary()}
            </p>
            <p>
              <span className="font-medium pr-1">Total:</span> ₹{orderItem.total}
            </p>
          </div>
          <div className="flex gap-2.5 mt-3">
            <button
              onClick={toggleDetails}
              className="flex-1 text-center text-xs font-semibold text-blue bg-blue-light-6 py-2 rounded-md"
            >
              View Details
            </button>
            {(orderItem.status === "pending" || orderItem.status === "confirmed") && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 text-center text-xs font-semibold text-red bg-red-light-6 py-2 rounded-md disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      )}

      {showDetails && (
        <OrderModal
          showDetails={showDetails}
          showEdit={false}
          toggleModal={toggleDetails}
          order={orderItem}
        />
      )}
    </>
  );
};

export default SingleOrder;
