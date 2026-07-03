"use client";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeCart } from "@/redux/features/cart-slice";
import { initializeWishlist } from "@/redux/features/wishlist-slice";

export default function ReduxInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeCart());
    dispatch(initializeWishlist());
  }, [dispatch]);

  return <>{children}</>;
}
