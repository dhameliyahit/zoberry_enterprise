"use client";
import React from "react";
import OrderDetails from "./OrderDetails";

interface OrderModalProps {
  showDetails: boolean;
  showEdit: boolean;
  toggleModal: (status: boolean) => void;
  order: any;
}

const OrderModal = ({ showDetails, showEdit, toggleModal, order }: OrderModalProps) => {
  if (!showDetails) {
    return null;
  }

  return (
    <div className="backdrop-filter-sm fixed inset-0 z-[99999] flex items-center justify-center bg-dark/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-[750px] my-8 rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => toggleModal(false)}
          className="absolute right-4 top-4 z-[9999] flex h-10 w-10 items-center justify-center rounded-full border border-gray-3 bg-white text-dark-4 hover:text-dark hover:shadow-md transition-all"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>

        {/* Modal Content Scrollable */}
        <div className="overflow-y-auto p-6 sm:p-9 flex-1">
          <OrderDetails orderItem={order} />
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
