"use client";
import React, { useEffect, useState, useRef } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { useUI } from "@/app/context/UIContext";
import { useAppSelector } from "@/redux/store";
import { recentlyViewedService, productService, authService } from "@/services";
import { useDispatch } from "react-redux";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { MagnifyingGlassPlus, Minus, Plus, Heart, CheckCircle, Star } from "@phosphor-icons/react";

const getYoutubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url?.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

const getThumbnailUrl = (url: string): string => {
  const ytId = getYoutubeId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return "/images/placeholder.png";
};

const getEmbedUrl = (url: string): string => {
  const ytId = getYoutubeId(url);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=1`;
  }
  return url;
};

const ShopDetails = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const [activeColor, setActiveColor] = useState("blue");
  const { openPreviewSlider, openAuthModal } = useUI();
  const [previewImg, setPreviewImg] = useState(0);

  const [storage, setStorage] = useState("gb128");
  const [type, setType] = useState("active");
  const [sim, setSim] = useState("dual");
  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState("tabOne");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("zoberry_token");
    const userStr = localStorage.getItem("zoberry_user");
    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const name = userData.data?.name || userData.name || "User";
          const email = userData.data?.email || userData.email || "";
          setLoggedInUser({ name, email });
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setIsLoggedIn(false);
      setLoggedInUser(null);
    }
  }, []);

  const storages = [
    { id: "gb128", title: "128 GB" },
    { id: "gb256", title: "256 GB" },
    { id: "gb512", title: "521 GB" },
  ];

  const types = [
    { id: "active", title: "Active" },
    { id: "inactive", title: "Inactive" },
  ];

  const sims = [
    { id: "dual", title: "Dual" },
    { id: "e-sim", title: "E Sim" },
  ];

  const tabs = [
    { id: "tabOne", title: "Description" },
    { id: "tabTwo", title: "Additional Information" },
    { id: "tabThree", title: "Reviews" },
  ];

  const colors = ["red", "blue", "orange", "pink", "purple"];

  const product = useAppSelector(
    (state) => state.productDetailsReducer.value
  );

  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isInWishlist = product ? wishlistItems.includes(product._id) : false;
  const router = useRouter();

  const handleAddToCart = () => {
    if (!product?._id) return;
    dispatch(
      addItemToCart({
        _id: product._id,
        quantity,
      })
    );
    toast.success("Added to Cart!");
  };

  const handlePurchaseNow = () => {
    if (!product?._id) return;
    dispatch(
      addItemToCart({
        _id: product._id,
        quantity,
      })
    );
    router.push("/cart");
  };

  const handleItemToWishList = () => {
    if (!product?._id) return;
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(product._id));
      toast.success("Removed from Watchlist");
    } else {
      dispatch(addItemToWishlist(product._id));
      toast.success("Added to Watchlist");
    }
  };

  const rawImages = product.images && product.images.length > 0
    ? product.images
    : [];
  const productImages = rawImages.map((img: any) =>
    typeof img === "string" ? img : img.url
  );

  const media = [
    ...(productImages?.map((img: string) => ({ type: "image" as const, url: img })) || []),
    ...(product.videos?.map((vid: any) => ({ type: "video" as const, url: vid.url, title: vid.title })) || [])
  ];

  const currentMedia = media[previewImg] || media[0];

  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const targetId = productId || product?._id;
    if (targetId && fetchedIdRef.current !== targetId) {
      fetchedIdRef.current = targetId;
      productService
        .getById(targetId)
        .then((res) => {
          if (res.success && res.data) {
            dispatch(updateproductDetails(res.data));
          }
        })
        .catch((err) => {
          console.error("Error fetching product details:", err);
        });
    }
  }, [productId, product?._id, dispatch]);

  useEffect(() => {
    setPreviewImg(0);
  }, [product?._id]);

  useEffect(() => {
    if (product && product.hasVariants && product.variantOptions) {
      const initial: Record<string, string> = {};
      product.variantOptions.forEach((opt: any) => {
        if (opt.values && opt.values.length > 0) {
          initial[opt.name] = opt.values[0];
        }
      });
      setSelectedVariants(initial);
    } else {
      setSelectedVariants({});
    }
  }, [product?._id, product?.hasVariants, product?.variantOptions]);

  const getSelectedVariant = () => {
    if (!product.hasVariants || !product.variants || product.variants.length === 0) return null;
    return product.variants.find((v: any) => {
      const selectedKeys = Object.entries(selectedVariants);
      if (selectedKeys.length === 0) return false;
      return selectedKeys.every(([key, val], idx) => {
        const optionField = `option${idx + 1}`;
        return v[optionField] === val;
      });
    }) || null;
  };

  const selectedVariant = getSelectedVariant();
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAt = selectedVariant?.price ? (product.compareAtPrice || product.price) : (product.compareAtPrice || null);
  const displayStock = selectedVariant?.stock ?? product.stock;
  const displayImage = selectedVariant?.image || (currentMedia?.type === "image" ? currentMedia.url : productImages[0]);

  useEffect(() => {
    if (product && product._id) {
      if (typeof window !== "undefined") {
        const macAddress = localStorage.getItem("zoberry_mac_address");
        if (macAddress) {
          recentlyViewedService.addRecentlyViewed(macAddress, product._id).catch((err) => {
            if (err?.message && (err.message.includes("already exists") || err.message.includes("macAddress"))) {
              return;
            }
            console.error("Error adding to recently viewed:", err);
          });
        }
      }
    }
  }, [product?._id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?._id) return;

    if (!authService.isAuthenticated()) {
      toast.error("Please sign in to submit a review");
      openAuthModal("signin");
      return;
    }

    if (!reviewComment) {
      toast.error("Please fill out the comment field");
      return;
    }

    try {
      const res = await productService.addReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success && res.data) {
        dispatch(updateproductDetails(res.data));
        toast.success("Review submitted successfully!");
        setReviewComment("");
        setReviewRating(5);
      } else {
        toast.error("Failed to submit review");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || error.message || "Failed to submit review");
    }
  };

  const handlePreviewSlider = () => {
    openPreviewSlider();
  };

  return (
    <>
      <Breadcrumb title={"Shop Details"} pages={["shop details"]} />

      {product.title === "" ? (
        "Please add product"
      ) : (
        <>
          <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
                <div className="lg:max-w-[570px] w-full flex flex-col-reverse sm:flex-row gap-6">
                  {/* Thumbnail Gallery */}
                  <div className="flex flex-row sm:flex-col gap-4.5 justify-start min-w-[80px]">
                    {media?.map((item, key) => (
                      <button
                        onClick={() => setPreviewImg(key)}
                        key={key}
                        className={`flex items-center justify-center w-15 sm:w-20 h-15 sm:h-20 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue relative ${key === previewImg
                          ? "border-blue"
                          : "border-transparent"
                          }`}
                      >
                        {item.type === "image" ? (
                          <Image
                            width={50}
                            height={50}
                            src={item.url}
                            alt="thumbnail"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-dark/10 relative">
                            {getYoutubeId(item.url) ? (
                              <>
                                <Image
                                  width={50}
                                  height={50}
                                  src={getThumbnailUrl(item.url)}
                                  alt="video thumbnail"
                                  className="opacity-70 object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/40 hover:bg-black/20 transition-colors">
                                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <svg className="w-8 h-8 text-gray-500 fill-current" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Main Product Image or Video */}
                  <div className="flex-1 lg:min-h-[512px] w-full rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                      {currentMedia?.type === "image" && (
                        <button
                          onClick={handlePreviewSlider}
                          aria-label="button for zoom"
                          className="gallery__Image w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                        >
                          <MagnifyingGlassPlus size={22} weight="bold" />
                        </button>
                      )}

                      {currentMedia?.type === "image" ? (
                        <Image
                          src={currentMedia.url}
                          alt="products-details"
                          width={400}
                          height={400}
                        />
                      ) : currentMedia?.type === "video" ? (
                        <div className="w-full h-full absolute inset-0 rounded-lg overflow-hidden flex items-center justify-center bg-black">
                          {getYoutubeId(currentMedia.url) ? (
                            <iframe
                              src={getEmbedUrl(currentMedia.url)}
                              className="w-full h-full absolute inset-0 object-cover scale-[1.02]"
                              allow="autoplay; encrypted-media; picture-in-picture"
                              allowFullScreen
                              title={currentMedia.title || "Product video"}
                            />
                          ) : (
                            <video
                              src={currentMedia.url}
                              controls
                              autoPlay
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Product Content */}
                <div className="max-w-[539px] w-full">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                      {product.title}
                    </h2>

                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                        {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const starValue = index + 1;
                          const isFilled = starValue <= (product.ratings?.average || 0);
                          return (
                            <Star
                              key={index}
                              size={18}
                              weight="fill"
                              className={isFilled ? "text-yellow" : "text-gray-4"}
                            />
                          );
                        })}
                      </div>

                      <span> ({product.ratings?.count || 0} customer reviews) </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CheckCircle
                        size={20}
                        weight="fill"
                        className={displayStock > 0 ? "text-green" : "text-[#E11D48]"}
                      />

                      <span className={displayStock > 0 ? "text-green" : "text-[#E11D48]"}>
                        {displayStock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-medium text-custom-1 mb-4.5 flex items-center gap-2">
                    <span className="text-sm sm:text-base text-dark">
                      Price: ₹{displayPrice}
                    </span>
                    {displayCompareAt && displayCompareAt > displayPrice && (
                      <span className="line-through text-dark-4">
                        ₹{displayCompareAt}
                      </span>
                    )}
                  </h3>

                  <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle size={20} weight="fill" className="text-blue" />
                      Free delivery available
                    </li>

                    <li className="flex items-center gap-2.5">
                      <CheckCircle size={20} weight="fill" className="text-blue" />
                      Sales {product.compareAtPrice && product.compareAtPrice > product.price ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 30}% Off Use Code: PROMO{product.compareAtPrice && product.compareAtPrice > product.price ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 30}
                    </li>
                  </ul>

                  {product.hasVariants && product.variantOptions && product.variantOptions.length > 0 ? (
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                        {product.variantOptions.map((opt: any, optKey: number) => (
                          <div key={optKey} className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="min-w-[100px]">
                              <h4 className="font-medium text-dark capitalize">{opt.name}:</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              {opt.values?.map((val: string, valKey: number) => {
                                const isSelected = selectedVariants[opt.name] === val;
                                const matchingVariant = product.variants?.find((v: any) => {
                                  const idx = product.variantOptions.findIndex((o: any) => o.name === opt.name);
                                  const field = `option${idx + 1}`;
                                  return v[field] === val && Object.entries(selectedVariants).every(([k, v2]) => {
                                    if (k === opt.name) return true;
                                    const idx2 = product.variantOptions.findIndex((o: any) => o.name === k);
                                    return v[`option${idx2 + 1}`] === v2;
                                  });
                                });
                                const extraPrice = matchingVariant?.price ? ` (+₹${matchingVariant.price})` : "";
                                return (
                                  <button
                                    type="button"
                                    key={valKey}
                                    onClick={() =>
                                      setSelectedVariants((prev) => ({
                                        ...prev,
                                        [opt.name]: val,
                                      }))
                                    }
                                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
                                      isSelected
                                        ? "border-blue bg-blue text-white shadow-sm"
                                        : "border-gray-3 bg-white text-dark hover:border-blue hover:text-blue"
                                    }`}
                                  >
                                    {val}
                                    {extraPrice}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </form>
                  ) : (
                    <div className="border-b border-gray-3 my-8"></div>
                  )}

                  <div className="flex flex-wrap items-center gap-4.5">
                    <div className="flex items-center rounded-md border border-gray-3">
                      <button
                        aria-label="button for remove product"
                        className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      >
                        <Minus size={20} weight="bold" />
                      </button>

                      <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                        {quantity}
                      </span>

                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        aria-label="button for add product"
                        className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                      >
                        <Plus size={20} weight="bold" />
                      </button>
                    </div>

                    <button
                      onClick={handlePurchaseNow}
                      className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Purchase Now
                    </button>

                    <button
                      onClick={handleAddToCart}
                      className="inline-flex font-medium text-white bg-dark py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue"
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={handleItemToWishList}
                      className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-3 ease-out duration-200 hover:text-white hover:bg-dark hover:border-transparent"
                    >
                      <Heart size={24} weight={isInWishlist ? "fill" : "bold"} className={isInWishlist ? "text-red" : "text-dark"} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden bg-gray-2 py-20">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              {/* Tab Header */}
              <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
                {tabs.map((item, key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(item.id)}
                    className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${activeTab === item.id
                      ? "text-blue before:w-full"
                      : "text-dark before:w-0"
                      }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {/* Tab Content - Description */}
              <div>
                <div className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${activeTab === "tabOne" ? "flex" : "hidden"}`}>
                  <div className="w-full">
                    <h2 className="font-medium text-2xl text-dark mb-7">Description:</h2>
                    <p className="mb-6 whitespace-pre-line text-dark-4 leading-relaxed">
                      {product.description || "No description available."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Content - Additional Information */}
              <div>
                <div className={`rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-10 ${activeTab === "tabTwo" ? "block" : "hidden"}`}>
                  {product.specifications && product.specifications.length > 0 ? (
                    product.specifications.map((spec: any, key: number) => (
                      <div key={key} className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                        <div className="max-w-[450px] min-w-[140px] w-full">
                          <p className="text-sm sm:text-base text-dark">{spec.key}</p>
                        </div>
                        <div className="w-full">
                          <p className="text-sm sm:text-base text-dark">{spec.value}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      No specifications available for this product.
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Content - Reviews */}
              <div>
                <div className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${activeTab === "tabThree" ? "flex" : "hidden"}`}>
                  <div className="max-w-[570px] w-full">
                    <h2 className="font-medium text-2xl text-dark mb-9">
                      {product.reviews && product.reviews.length > 0
                        ? `${product.reviews.length.toString().padStart(2, "0")} Review${product.reviews.length === 1 ? "" : "s"} for this product`
                        : "No reviews yet"}
                    </h2>

                    <div className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2">
                      {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((rev: any, key: number) => (
                          <div key={key} className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12.5 h-12.5 rounded-full overflow-hidden bg-blue/10 flex items-center justify-center font-bold text-blue text-lg border border-blue/20">
                                  {rev.name ? rev.name.charAt(0).toUpperCase() : "R"}
                                </div>

                                <div>
                                  <h3 className="font-medium text-dark">{rev.name}</h3>
                                  <p className="text-custom-sm text-dark-4">
                                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : ""}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => {
                                  const starValue = index + 1;
                                  const isFilled = starValue <= rev.rating;
                                  return (
                                    <Star
                                      key={index}
                                      size={15}
                                      weight="fill"
                                      className={isFilled ? "text-yellow" : "text-gray-4"}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            <p className="text-dark mt-6 break-words whitespace-pre-wrap">
                              {rev.comment}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-5 bg-white rounded-xl shadow-1">
                          Be the first to review this product!
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="max-w-[550px] w-full">
                    <form onSubmit={handleReviewSubmit}>
                      <h2 className="font-medium text-2xl text-dark mb-3.5">Add a Review</h2>

                      <p className="mb-6">
                        Your email address will not be published. Required fields are marked *
                      </p>

                      <div className="flex items-center gap-3 mb-7.5">
                        <span>Your Rating*</span>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const starValue = index + 1;
                            const isFilled = starValue <= reviewRating;
                            return (
                              <span
                                key={index}
                                onClick={() => setReviewRating(starValue)}
                                className={`cursor-pointer transition-colors duration-150 ${
                                  isFilled ? "text-yellow" : "text-gray-4 hover:text-yellow"
                                }`}
                              >
                                <Star size={15} weight="fill" />
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                        {isLoggedIn ? (
                          <>
                            <div className="mb-5 bg-gray-1 rounded-md py-3 px-4 text-custom-sm text-dark-4 border border-gray-3">
                              Posting review as <span className="font-semibold text-dark">{loggedInUser?.name}</span> ({loggedInUser?.email}). Not you?{" "}
                              <button
                                type="button"
                                onClick={() => {
                                  authService.logout();
                                  window.location.reload();
                                }}
                                className="text-red hover:underline font-medium ml-1"
                              >
                                Logout
                              </button>
                            </div>

                            <div className="mb-5">
                              <label htmlFor="comments" className="block mb-2.5">Comments</label>

                              <textarea
                                name="comments"
                                id="comments"
                                rows={5}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Your comments"
                                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                                maxLength={250}
                                required
                              ></textarea>

                              <span className="flex items-center justify-between mt-2.5">
                                <span className="text-custom-sm text-dark-4">Maximum</span>
                                <span className="text-custom-sm text-dark-4">{reviewComment.length}/250</span>
                              </span>
                            </div>

                            <button
                              type="submit"
                              className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                            >
                              Submit Reviews
                            </button>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="mb-4 text-dark-4">Please sign in to leave a review for this product.</p>
                            <button
                              type="button"
                              onClick={() => openAuthModal("signin")}
                              className="font-medium text-white bg-dark py-2.5 px-6 rounded-lg ease-out duration-200 hover:bg-blue"
                            >
                              Sign In to Review
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <RecentlyViewdItems currentProductId={product._id} />

          <Newsletter />
        </>
      )}
    </>
  );
};

export default ShopDetails;
