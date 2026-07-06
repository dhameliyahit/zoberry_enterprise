"use client";
import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useUI } from "@/app/context/UIContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Heart, Star, ShoppingCart } from "@phosphor-icons/react";

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

const ProductItem = ({ item }: { item: Product }) => {
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

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  const handleCardClick = () => {
    handleProductDetails();
    router.push(`/shop-details?id=${item._id}`);
  };

  const badge = getBadge(item);

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-[#F6F7FB] aspect-square mb-4">
        {/* Badge overlay */}
        {badge && (
          <span className={`absolute top-2.5 left-2.5 z-10 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm ${badge.color}`}>
            {badge.label}
          </span>
        )}

        <Image
          src={getImageUrl(item.images?.[0])}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-105"
        />

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
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
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="inline-flex items-center gap-1.5 font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
          >
            <ShoppingCart size={14} weight="bold" />
            Add to cart
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleItemToWishList();
            }}
            aria-label="button for favorite select"
            id="favOne"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 bg-white hover:text-blue"
          >
            <Heart size={16} weight={isInWishlist ? "fill" : "bold"} className={isInWishlist ? "text-red" : "text-dark"} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} weight="fill" className="text-yellow" />
          ))}
        </div>

        <p className="text-custom-sm text-gray-400">({item.ratings?.count || 0})</p>
      </div>

      <h3
        className="font-medium text-dark text-sm leading-snug ease-out duration-200 hover:text-blue mb-1.5 line-clamp-2"
        onClick={() => handleProductDetails()}
      >
        <Link href={`/shop-details?id=${item._id}`}> {item.title} </Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark">₹{item.price}</span>
        {item.compareAtPrice && item.compareAtPrice > item.price && (
          <span className="text-dark-4 line-through text-sm">₹{item.compareAtPrice}</span>
        )}
      </span>
    </div>
  );
};

export default ProductItem;
