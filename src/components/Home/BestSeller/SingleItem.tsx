"use client";
import React from "react";
import { Product } from "@/types/product";
import { useUI } from "@/app/context/UIContext";
import { useDispatch } from "react-redux";
import { updateproductDetails } from "@/redux/features/product-details";
import { AppDispatch, useAppSelector } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { Eye, ShoppingCart, Heart, Star } from "@phosphor-icons/react";

function getImageUrl(img: string | { url: string; alt?: string; isFeatured?: boolean } | undefined): string {
  if (!img) return "";
  return typeof img === "string" ? img : img.url || "";
}

function getBadge(item: Product): { label: string; color: string } | null {
  const discount = item.price && item.discountedPrice
    ? Math.round(((item.price - item.discountedPrice) / item.price) * 100)
    : 0;

  if (discount >= 50) return { label: `${discount}% OFF`, color: "bg-red text-white" };
  if (item.ratings?.count && item.ratings.count > 10) return { label: "Top Rated", color: "bg-yellow text-dark" };
  if (discount >= 20) return { label: "Trending", color: "bg-blue text-white" };
  return null;
}

const SingleItem = ({ item }: { item: Product }) => {
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
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(item._id));
    } else {
      dispatch(addItemToWishlist(item._id));
    }
  };

  const badge = getBadge(item);

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  const handleCardClick = () => {
    handleProductDetails();
    router.push(`/shop-details?id=${item._id}`);
  };

  return (
    <div 
      className="group cursor-pointer bg-white rounded-xl border border-gray-2 p-4.5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Image container on top */}
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-gray-1 aspect-square mb-4.5">
        {/* Badge overlay */}
        {badge && (
          <span className={`absolute top-2.5 left-2.5 z-10 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm ${badge.color}`}>
            {badge.label}
          </span>
        )}

        <Image
          src={getImageUrl(item.images?.[0])}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 220px"
          className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-105"
        />

        {/* Hover Quick Actions */}
        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2 pb-4 ease-linear duration-200 group-hover:translate-y-0 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickViewUpdate();
              openQuickView(item);
            }}
            aria-label="button for quick view"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue hover:bg-gray-50"
          >
            <Eye size={16} weight="bold" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            aria-label="button for add to cart"
            className="inline-flex items-center gap-1 font-bold text-xs py-2 px-4 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
          >
            <ShoppingCart size={14} weight="bold" />
            Add
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleItemToWishList();
            }}
            aria-label="button for add to fav"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 bg-white hover:text-blue hover:bg-gray-50"
          >
            <Heart size={16} weight={isInWishlist ? "fill" : "bold"} className={isInWishlist ? "text-red" : "text-dark"} />
          </button>
        </div>
      </div>

      {/* Metadata below the image */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Ratings & reviews */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} weight="fill" className="text-yellow" />
              ))}
            </div>
            <p className="text-[11px] text-gray-400 font-medium">({item.ratings?.count || 0})</p>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-dark text-sm leading-snug ease-out duration-200 hover:text-blue mb-2 line-clamp-2">
            <Link
              href={`/shop-details?id=${item._id}`}
              onClick={(e) => {
                e.stopPropagation();
                handleProductDetails();
              }}
            >
              {item.title}
            </Link>
          </h3>
        </div>

        {/* Product Price */}
        <div className="flex items-baseline gap-2 font-bold text-base mt-1">
          <span className="text-dark">₹{item.price.toLocaleString("en-IN")}</span>
          {item.compareAtPrice && item.compareAtPrice > item.price && (
            <span className="text-dark-4 line-through text-xs font-normal">
              ₹{item.compareAtPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
