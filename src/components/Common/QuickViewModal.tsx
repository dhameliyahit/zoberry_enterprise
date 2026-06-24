"use client";
import React, { useEffect, useRef, useState } from "react";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch<AppDispatch>();

  // Get the product data
  const product = useAppSelector((state) => state.quickViewReducer.value);

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
    openPreviewModal();
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        _id: product._id,
        title: product.title,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: product.images?.[0] || "",
        quantity,
      })
    );
    closeModal();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target && !target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setQuantity(1);
    };
  }, [isModalOpen, closeModal]);

  return (
    <div
      className={`${
        isModalOpen ? "z-99999" : "hidden"
      } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 bg-dark/70 sm:px-8 px-4 py-5`}
    >
      <div className="flex items-center justify-center min-h-full">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-6 sm:p-7.5 relative modal-content">
          {/* Close Button */}
          <button
            onClick={() => closeModal()}
            aria-label="Close modal"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-gray-2 text-body hover:text-dark z-50"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
              />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12.5">
            {/* Left Column: Images Product Side */}
            <div className="w-full">
              <div className="flex gap-4 sm:gap-5">
                {/* Thumbnails list */}
                <div className="flex flex-col gap-3 sm:gap-4 flex-shrink-0">
                  {product.images?.map((img, key) => (
                    <button
                      onClick={() => setActivePreview(key)}
                      key={key}
                      className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue relative p-1.5 ${
                        activePreview === key ? "border-2 border-blue" : "border border-gray-2"
                      }`}
                    >
                      <div className="w-full h-full relative">
                        <Image
                          src={img || "/images/placeholder.png"}
                          alt="thumbnail"
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Main image view with magnifier context */}
                <div 
                  ref={imageContainerRef}
                  className="relative flex items-center justify-center w-full aspect-square bg-gray-1 rounded-lg border border-gray-3 p-4 cursor-crosshair select-none"
                  onMouseEnter={() => setShowMagnifier(true)}
                  onMouseLeave={() => setShowMagnifier(false)}
                  onMouseMove={handleMagnifierMove}
                >
                  {/* Fullscreen Slider Button Trigger */}
                  <button
                    onClick={handlePreviewSlider}
                    aria-label="Zoom image"
                    className="w-10 h-10 rounded-[5px] bg-white shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 right-4 z-20"
                  >
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zm1-7h3v2H9v3H7V9H4V7h3V4h2v3z"
                      />
                    </svg>
                  </button>

                  {/* Main Display Image */}
                  {product?.images?.[activePreview] && (
                    <div className="w-full h-full relative overflow-hidden rounded-lg">
                      <Image
                        src={product.images[activePreview]}
                        alt="product-details"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 500px"
                        priority
                      />
                    </div>
                  )}

                  {/* Small pointer square tracker on hover */}
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

                  {/* FIXED INDEPENDENT ZOOM BOX CONTAINER */}
                  {showMagnifier && product?.images?.[activePreview] && (
                    <div
                      className="absolute left-[103%] top-0 w-full h-full rounded-lg border border-gray-3 overflow-hidden bg-white shadow-3 hidden lg:block z-50 pointer-events-none"
                      style={{
                        backgroundImage: `url(${product.images[activePreview]})`,
                        backgroundSize: "280%",
                        backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

             {/* Right Column: Product Info Text Details */}
            <div className="w-full flex flex-col justify-center">
              {product.price > product.discountedPrice && (
                <span className="inline-block self-start text-xs font-semibold text-white py-1 px-3 bg-green mb-4 rounded">
                  {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                </span>
              )}

              <h3 className="font-semibold text-xl xl:text-2xl text-dark mb-3">
                {product.title}
              </h3>

              <div className="flex flex-wrap items-center gap-5 mb-5">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const starValue = index + 1;
                      const isFilled = starValue <= Math.round(product.ratings?.average || 0);
                      return (
                        <svg
                          key={index}
                          className={isFilled ? "fill-[#FFA645]" : "fill-gray-4"}
                          width="16"
                          height="16"
                          viewBox="0 0 18 18"
                        >
                          <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" />
                        </svg>
                      );
                    })}
                  </div>
                  <span className="text-sm">
                    <strong className="text-dark">{(product.ratings?.average || 0).toFixed(1)} Rating</strong> <span className="text-dark-2">({product.ratings?.count || 0} reviews)</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z" fill="#22AD5C" />
                    <path d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z" fill="#22AD5C" />
                  </svg>
                  <span className="font-medium text-dark text-sm">{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                </div>
              </div>

              <p className="text-body text-sm leading-relaxed mb-6 line-clamp-6">
                {product.description || "No description available."}
              </p>

              {/* Price and Quantity selectors */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-y border-gray-2 py-4 mb-6">
                <div>
                  <h4 className="font-semibold text-sm text-dark-3 mb-1.5">Price</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-dark text-xl sm:text-2xl">
                      ₹{product.discountedPrice}
                    </span>
                    <span className="text-sm font-medium text-gray-4 line-through">
                      ₹{product.price}
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
                      <svg className="fill-current" width="12" height="2" viewBox="0 0 16 2">
                        <path d="M0 1C0 0.447715 0.447715 0 1 0H15C15.5523 0 16 0.447715 16 1C16 1.55228 15.5523 2 15 2H1C0.447715 2 0 1.55228 0 1Z"/>
                      </svg>
                    </button>
                    <span className="flex items-center justify-center w-14 h-9 rounded border border-gray-3 bg-white font-medium text-dark text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex items-center justify-center w-9 h-9 rounded bg-gray-2 text-dark hover:text-blue transition"
                    >
                      <svg className="fill-current" width="12" height="12" viewBox="0 0 16 16">
                        <path d="M8 0C8.55228 0 9 0.447715 9 1V7H15C15.5523 7 16 7.44772 16 8C16 8.55228 15.5523 9 15 9H9V15C9 15.5523 8.55228 16 8 16C7.44772 16 7 15.5523 7 15V9H1C0.447715 9 0 8.55228 0 8C0 7.44772 0.447715 7 1 7H7V1C7 0.447715 7.44772 0 8 0Z"/>
                      </svg>
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
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 20 20">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.68698 3.68688C3.30449 4.31882 2.29169 5.82191 2.29169 7.6143C2.29169 9.44546 3.04103 10.8569 4.11526 12.0665C5.00062 13.0635 6.07238 13.8897 7.11763 14.6956C7.36588 14.8869 7.61265 15.0772 7.85506 15.2683C8.29342 15.6139 8.68445 15.9172 9.06136 16.1374C9.43847 16.3578 9.74202 16.4584 10 16.4584C10.258 16.4584 10.5616 16.3578 10.9387 16.1374C11.3156 15.9172 11.7066 15.6139 12.145 15.2683C12.3874 15.0772 12.6342 14.8869 12.8824 14.6956C13.9277 13.8897 14.9994 13.0635 15.8848 12.0665C16.959 10.8569 17.7084 9.44546 17.7084 7.6143C17.7084 5.82191 16.6955 4.31882 15.3131 3.68688ZM10 3.71573C8.07331 1.99192 5.91582 1.75077 4.16732 2.55002C2.32061 3.39415 1.04169 5.35424 1.04169 7.6143C1.04169 9.83557 1.9671 11.5301 3.18062 12.8966C4.15241 13.9908 5.34187 14.9067 6.39237 15.7155C6.39237 15.7155 6.63051 15.8989 6.8615 16.0767C7.0812 16.2499 7.50807 16.5864 7.96631 16.9453C8.43071 17.2166 8.8949 17.4879 9.42469 17.7084 10 17.7084C10.5754 17.7084 11.1051 17.4879 11.5693 17.2166C12.0337 16.9453 12.492 16.5864 12.9188 16.2499C13.1385 16.0767 13.3695 15.8989 13.6077 15.7155C14.6582 14.9067 15.8476 13.9908 16.8194 12.8966C18.0329 11.5301 18.9584 9.83557 18.9584 7.6143C18.9584 5.35424 17.6794 3.39415 15.8327 2.55002C14.0842 1.75077 11.9267 1.99192 10 3.71573Z" />
                  </svg>
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