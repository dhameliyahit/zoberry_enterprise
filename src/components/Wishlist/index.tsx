"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { usePopulatedWishlist } from "@/hooks/usePopulatedWishlist";
import SingleItem from "./SingleItem";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";

export const Wishlist = () => {
  const { items: wishlistItems, loading } = usePopulatedWishlist();
  const dispatch = useDispatch<AppDispatch>();

  const handleClearWishlist = () => {
    dispatch(removeAllItemsFromWishlist());
  };

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            <button onClick={handleClearWishlist} className="text-blue">Clear Wishlist Cart</button>
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-dark">Product</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-dark">Unit Price</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-dark">Stock Status</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-dark text-right">Action</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {loading ? (
                  <div className="text-center py-10 text-dark">Loading wishlist items...</div>
                ) : wishlistItems.length > 0 ? (
                  wishlistItems.map((item, key) => (
                    <SingleItem item={item} key={key} />
                  ))
                ) : (
                  <div className="text-center py-10 text-dark">Your wishlist is empty!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
