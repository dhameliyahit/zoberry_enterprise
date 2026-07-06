"use client";
import React from "react";

import { Product } from "@/types/product";
import { useUI } from "@/app/context/UIContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { updateproductDetails } from "@/redux/features/product-details";
import { AppDispatch, useAppSelector } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, ShoppingCart, Heart, Star } from "@phosphor-icons/react";

function getImageUrl(img: string | { url: string; alt?: string; isFeatured?: boolean } | undefined): string {
  if (!img) return "";
  return typeof img === "string" ? img : img.url || "";
}

const SingleListItem = ({ item }: { item: Product }) => {
  const { openQuickView } = useUI();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isInWishlist = wishlistItems.includes(item._id);

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        _id: item._id,
        quantity: 1,
      })
    );
  };

  const handleItemToWishList = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("zoberry_token") : null;
    if (!token) {
      router.push("/signin");
      return;
    }
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(item._id));
    } else {
      dispatch(addItemToWishlist(item._id));
    }
  };

  return (
    <div className="group rounded-lg bg-white shadow-1">
      <div className="flex">
        <div className="shadow-list relative overflow-hidden flex items-center justify-center max-w-[270px] w-full sm:min-h-[270px] p-4">
          <Image src={getImageUrl(item.images?.[0])} alt="" width={250} height={250} />

          <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
            <button
              onClick={() => {
                openQuickView(item);
                handleQuickViewUpdate();
              }}
              aria-label="button for quick view"
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
            >
              <Eye size={16} weight="bold" />
            </button>

            <button
              onClick={() => handleAddToCart()}
              className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
            >
              Add to cart
            </button>

            <button
              onClick={() => handleItemToWishList()}
              aria-label="button for favorite select"
              className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 bg-white hover:text-blue"
            >
              <Heart size={16} weight={isInWishlist ? "fill" : "bold"} className={isInWishlist ? "text-red" : "text-dark"} />
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col gap-5 sm:flex-row sm:items-center justify-center sm:justify-between py-5 px-4 sm:px-7.5 lg:pl-11 lg:pr-12">
          <div>
            <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
              <Link
                href={`/shop-details?id=${item._id}`}
                onClick={() => dispatch(updateproductDetails({ ...item }))}
              >
                {item.title}
              </Link>
            </h3>

            <span className="flex items-center gap-2 font-medium text-lg">
              <span className="text-dark">₹{item.price}</span>
              <span className="text-dark-4 line-through">₹{item.price}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} weight="fill" className="text-yellow" />
              ))}
            </div>

            <p className="text-custom-sm">({item.ratings?.count || 0})</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;
