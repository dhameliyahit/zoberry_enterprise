"use client";
import React, { useEffect, useRef, useState } from "react";
import { useUI } from "@/app/context/UIContext";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { updateproductDetails } from "@/redux/features/product-details";
import { X, MagnifyingGlassPlus, Minus, Plus, CheckCircle, Heart, Star } from "@phosphor-icons/react";

function getImageUrl(img: string | { url: string; alt?: string; isFeatured?: boolean } | undefined): string {
  if (!img) return "";
  return typeof img === "string" ? img : img.url || "";
}

const QuickViewModal = () => {
  const { quickViewOpen, closeQuickView, quickViewProduct, openPreviewSlider } = useUI();
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch<AppDispatch>();

  const product = quickViewProduct;

  const [activePreview, setActivePreview] = useState(0);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMagnifierMove = (e: React.MouseEvent) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    setMagnifierPos({ x, y });
  };

  const handlePreviewSlider = () => {
    dispatch(updateproductDetails(product));
    openPreviewSlider();
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        _id: product._id,
        title: product.title,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: getImageUrl(product.images?.[0]),
        quantity,
      })
    );
    closeQuickView();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target && !target.closest(".modal-content")) {
        closeQuickView();
      }
    }

    if (quickViewOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setQuantity(1);
    };
  }, [quickViewOpen, closeQuickView]);

  return (
    <div
      className={`${
        quickViewOpen ? "z-99999" : "hidden"
      } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 bg-dark/70 sm:px-8 px-4 py-5`}
    >
      <div className="flex items-center justify-center min-h-full">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-6 sm:p-7.5 relative modal-content">
          {/* Close Button */}
          <button
            onClick={() => closeQuickView()}
            aria-label="Close modal"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-gray-2 text-body hover:text-dark z-50"
          >
            <X size={24} weight="bold" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12.5">
            {/* Left Column: Images */}
            <div className="w-full">
              <div className="flex gap-4 sm:gap-5">
                {/* Thumbnails list */}
                <div className="flex flex-col gap-3 sm:gap-4 flex-shrink-0">
                  {product?.images?.map((img, key) => (
                    <button
                      onClick={() => setActivePreview(key)}
                      key={key}
                      className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue relative p-1.5 ${
                        activePreview === key ? "border-2 border-blue" : "border border-gray-2"
                      }`}
                    >
                      <div className="w-full h-full relative">
                        <Image
                          src={typeof img === "string" ? img : img.url || "/images/placeholder.png"}
                          alt="thumbnail"
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Main image view with magnifier */}
                <div
                  ref={imageContainerRef}
                  className="relative flex items-center justify-center w-full aspect-square bg-gray-1 rounded-lg border border-gray-3 p-4 cursor-crosshair select-none"
                  onMouseEnter={() => setShowMagnifier(true)}
                  onMouseLeave={() => setShowMagnifier(false)}
                  onMouseMove={handleMagnifierMove}
                >
                  {/* Zoom Button */}
                  <button
                    onClick={handlePreviewSlider}
                    aria-label="Zoom image"
                    className="w-10 h-10 rounded-[5px] bg-white shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 right-4 z-20"
                  >
                    <MagnifyingGlassPlus size={20} weight="bold" />
                  </button>

                  {/* Main Display Image */}
                  {product?.images?.[activePreview] && (
                    <div className="w-full h-full relative overflow-hidden rounded-lg">
                      <Image
                        src={getImageUrl(product.images[activePreview])}
                        alt="product-details"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 500px"
                        priority
                      />
                    </div>
                  )}

                  {/* Magnifier overlay */}
                  {showMagnifier && (
                    <div
                      className="absolute pointer-events-none z-10 border border-blue bg-blue/10 hidden sm:block rounded-md"
                      style={{
                        width: "120px",
                        height: "120px",
                        left: `${magnifierPos.x}%`,
                        top: `${magnifierPos.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}

                  {/* Zoom box */}
                  {showMagnifier && product?.images?.[activePreview] && (
                    <div
                      className="absolute left-[103%] top-0 w-full h-full rounded-lg border border-gray-3 overflow-hidden bg-white shadow-3 hidden lg:block z-50 pointer-events-none"
                      style={{
                        backgroundImage: `url(${getImageUrl(product.images[activePreview])})`,
                        backgroundSize: "280%",
                        backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Product Info */}
            <div className="w-full flex flex-col justify-center">
              {product?.price > product?.discountedPrice && (
                <span className="inline-block self-start text-xs font-semibold text-white py-1 px-3 bg-green mb-4 rounded">
                  {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                </span>
              )}

              <h3 className="font-semibold text-xl xl:text-2xl text-dark mb-3">
                {product?.title}
              </h3>

              <div className="flex flex-wrap items-center gap-5 mb-5">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const starValue = index + 1;
                      const isFilled = starValue <= Math.round(product?.ratings?.average || 0);
                      return (
                        <Star
                          key={index}
                          size={16}
                          weight="fill"
                          className={isFilled ? "text-yellow" : "text-gray-4"}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm">
                    <strong className="text-dark">{(product?.ratings?.average || 0).toFixed(1)} Rating</strong> <span className="text-dark-2">({product?.ratings?.count || 0} reviews)</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CheckCircle size={18} weight="fill" className="text-green" />
                  <span className="font-medium text-dark text-sm">{product?.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                </div>
              </div>

              <p className="text-body text-sm leading-relaxed mb-6 line-clamp-6">
                {product?.description || "No description available."}
              </p>

              {/* Price and Quantity */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-y border-gray-2 py-4 mb-6">
                <div>
                  <h4 className="font-semibold text-sm text-dark-3 mb-1.5">Price</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-dark text-xl sm:text-2xl">
                      ₹{product?.discountedPrice}
                    </span>
                    <span className="text-sm font-medium text-gray-4 line-through">
                      ₹{product?.price}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-dark-3 mb-1.5">Quantity</h4>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="flex items-center justify-center w-9 h-9 rounded bg-gray-2 text-dark hover:text-blue transition disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus size={12} weight="bold" />
                    </button>
                    <span className="flex items-center justify-center w-14 h-9 rounded border border-gray-3 bg-white font-medium text-dark text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex items-center justify-center w-9 h-9 rounded bg-gray-2 text-dark hover:text-blue transition"
                    >
                      <Plus size={12} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  disabled={quantity === 0}
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[140px] font-medium text-white bg-blue py-3 px-6 rounded-md transition hover:bg-blue-dark text-center text-sm"
                >
                  Add to Cart
                </button>

                <button className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 font-medium text-white bg-dark py-3 px-5 rounded-md transition hover:bg-opacity-90 text-sm">
                  <Heart size={18} weight="bold" />
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
