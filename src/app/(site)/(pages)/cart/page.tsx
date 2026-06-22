import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cart Page | Zoberry Enterprise",
  description: "Zoberry Enterprise - Cart Page",
  // other metadata
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
