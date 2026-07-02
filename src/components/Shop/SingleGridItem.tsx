"use client";
import React from "react";
import { Product } from "@/types/product";
import { useUI } from "@/app/context/UIContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { Eye, ShoppingCart, Heart, Star } from "@phosphor-icons/react";

function getImageUrl(img: string | { url: string; alt?: string; isFeatured?: boolean } | undefined): string {
  if (!img) return "";
  return typeof img === "string" ? img : img.url || "";
}

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openQuickView } = useUI();
  const dispatch = useDispatch<AppDispatch>();

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        _id: item._id,
        title: item.title,
        price: item.price,
        discountedPrice: item.discountedPrice,
        image: getImageUrl(item.images?.[0]),
        quantity: 1,
      })
    );
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        _id: item._id,
        title: item.title,
        price: item.price,
        discountedPrice: item.discountedPrice,
        image: getImageUrl(item.images?.[0]),
        status: "available",
        quantity: 1,
      })
    );
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white shadow-1 min-h-[270px] mb-4">
        <Image src={getImageUrl(item.images?.[0])} alt="" width={250} height={250} />

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            onClick={() => {
              openQuickView(item);
              handleQuickViewUpdate();
            }}
            id="newOne"
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
            id="favOne"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
          >
            <Heart size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={15} weight="fill" className="text-yellow" />
          ))}
        </div>

        <p className="text-custom-sm">({item.ratings?.count || 0})</p>
      </div>

      <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
        <Link href="/shop-details"> {item.title} </Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark">₹{item.discountedPrice}</span>
        <span className="text-dark-4 line-through">₹{item.price}</span>
      </span>
    </div>
  );
};

export default SingleGridItem;
