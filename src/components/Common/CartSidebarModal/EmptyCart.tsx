import React from "react";
import Link from "next/link";
import { useUI } from "@/app/context/UIContext";
import { ShoppingCart } from "@phosphor-icons/react";

const EmptyCart = () => {
  const { closeCartSidebar } = useUI();

  return (
    <div className="text-center">
      <div className="mx-auto pb-7.5">
        <div className="flex items-center justify-center w-[100px] h-[100px] rounded-full bg-gray-1 mx-auto">
          <ShoppingCart size={48} weight="light" className="text-gray-4" />
        </div>
      </div>

      <p className="pb-6">Your cart is empty!</p>

      <Link
        onClick={() => closeCartSidebar()}
        href="/shop-with-sidebar"
        className="w-full lg:w-10/12 mx-auto flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-opacity-95"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default EmptyCart;
