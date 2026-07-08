"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useUI } from "@/app/context/UIContext";
import { addItemToCart } from "@/redux/features/cart-slice";
import { AppDispatch } from "@/redux/store";
import {
  CaretLeft,
  CaretRight,
  ShoppingCart,
  Play,
  Pause,
  SpeakerSimpleX,
  SpeakerSimpleHigh,
  ArrowsOut,
  ArrowRight,
  Star,
  Sparkle,
  ShareNetwork,
  Heart,
} from "@phosphor-icons/react";

interface Product {
  _id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  stock?: number;
  ratings?: { average: number; count: number };
  images?: { url: string; alt: string; isFeatured: boolean }[];
  status?: string;
  isFeatured?: boolean;
}

interface HeroVideo {
  _id: string;
  title: string;
  url: string;
  product?: Product;
  isActive: boolean;
  order: number;
}

const FALLBACK_SHORTS = [
  { id: "v1", title: "Smart Kitchen Cleaning Gadget", url: "https://www.youtube.com/shorts/qC_081aWJ_M" },
  { id: "v2", title: "Automatic Can Opener Utility", url: "https://www.youtube.com/shorts/9YvH0142_mQ" },
  { id: "v3", title: "Multi-Purpose Home Organizer", url: "https://www.youtube.com/shorts/4yQ070xG7mE" },
];

export default function HeroVideoPlayer() {
  const dispatch = useDispatch<AppDispatch>();
  const { openCartSidebar } = useUI();

  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Video Playback & Progress States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Swipe gesture tracking
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  const getInstagramId = (url: string) => {
    const match = url.match(/(?:instagram\.com\/reel\/)([^/?#]+)/);
    return match && match[1] ? match[1] : "";
  };

  const getEmbedUrl = (video: HeroVideo) => {
    const ytId = getYoutubeId(video.url);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1`;
    }
    const igId = getInstagramId(video.url);
    if (igId) {
      return `https://www.instagram.com/reel/${igId}/embed`;
    }
    return video.url;
  };

  const getThumbnailUrl = (video: HeroVideo) => {
    const ytId = getYoutubeId(video.url);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    return "/images/zb_header.png";
  };

  const getProductImage = (product?: Product) => {
    if (!product || !product.images || product.images.length === 0) return "/images/zb_header.png";
    const featured = product.images.find((img) => img.isFeatured);
    return featured?.url || product.images[0].url || "/images/zb_header.png";
  };

  const getDiscountPercent = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const sendYoutubeCommand = (func: string) => {
    try {
      const iframe = document.getElementById("active-youtube-iframe") as HTMLIFrameElement | null;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: func, args: "" }),
          "*"
        );
      }
    } catch (e) {
      console.warn("Could not post message to YouTube iframe", e);
    }
  };

  // Fetch Videos & Products
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/hero-videos");
        const resData = await res.json();

        if (resData.success && resData.data && resData.data.length > 0) {
          setVideos(resData.data);
        } else {
          // Fallback seeding
          const productsRes = await fetch("/api/products?limit=5");
          const productsData = await productsRes.json();
          const items = productsData.data?.products || productsData.data || [];

          const fallbacks: HeroVideo[] = FALLBACK_SHORTS.map((s, idx) => {
            const p = items[idx % items.length];
            return {
              _id: s.id,
              title: s.title,
              url: s.url,
              isActive: true,
              order: idx,
              product: p
                ? {
                  _id: p._id,
                  title: p.title,
                  price: p.price,
                  compareAtPrice: p.compareAtPrice,
                  description: p.description || "Premium unboxing showcase of top trending e-commerce gadget utility.",
                  stock: p.stock || 25,
                  ratings: p.ratings || { average: 4.8, count: 42 },
                  images: p.images,
                  isFeatured: p.isFeatured,
                }
                : undefined,
            };
          });
          setVideos(fallbacks);
        }
      } catch (err) {
        console.error("Failed to load hero carousel data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Sync Video Controls (Play, Pause, Mute)
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
    sendYoutubeCommand(isPlaying ? "playVideo" : "pauseVideo");
  }, [isPlaying, activeIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
    sendYoutubeCommand(isMuted ? "mute" : "unMute");
  }, [isMuted, activeIndex]);

  // Unified Auto-Progress Timer (Instagram Stories Style)
  useEffect(() => {
    if (!isPlaying || videos.length === 0) return;

    const currentVid = videos[activeIndex];
    const isIframe = getYoutubeId(currentVid.url) || getInstagramId(currentVid.url);

    // If it's a native video, progress and next-video advance are handled by onTimeUpdate and onEnded.
    if (!isIframe) return;

    if (isHovered) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        // Fallback 15 seconds for iframes
        return prev + (100 / (15000 / 80));
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, activeIndex, videos]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % videos.length);
    setProgress(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setProgress(0);
    setIsPlaying(true);
  };

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videos.length]);

  // Fullscreen implementation
  const handleFullscreen = () => {
    try {
      const container = document.getElementById("active-video-card-container");
      if (container) {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(() => { });
        } else {
          document.exitFullscreen().catch(() => { });
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const swipeOccurred = useRef(false);

  // Swipe trigger methods
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    swipeOccurred.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    if (touchStart && Math.abs(touchStart - currentX) > 15) {
      swipeOccurred.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minDistance = 50;
    if (distance > minDistance) {
      handleNext();
    } else if (distance < -minDistance) {
      handlePrev();
    }
  };

  // Cart Add Logic & Drawer Trigger (Instant Checkout)
  const handleAddToCartFlow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    dispatch(
      addItemToCart({
        _id: product._id,
        quantity: 1,
      })
    );
    openCartSidebar();
  };

  const renderRatingStars = (average: number = 0) => {
    const stars = [];
    const avg = average || 4.5;
    const rounded = Math.round(avg);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          weight={i <= rounded ? "fill" : "fill"}
          className={i <= rounded ? "text-[#2B355A]" : "text-gray-300"}
        />
      );
    }
    return stars;
  };

  const getDynamicBadge = (product?: Product) => {
    if (!product) return "Trending";
    if (product.ratings && product.ratings.average >= 4.7) return "Best Seller";
    if (product.compareAtPrice && product.compareAtPrice > product.price) return "Hot Deal";
    if (product.isFeatured) return "Exclusive";
    return "New Arrival";
  };

  if (loading) {
    return (
      <div className="flex h-[520px] w-full items-center justify-center rounded-[10px] bg-slate-950/95">
        <div className="text-center text-white/50">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-blue" />
          <p className="text-xs font-semibold">Loading Live Demos...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) return null;

  const currentVideo = videos[activeIndex];
  const prevIndex = (activeIndex - 1 + videos.length) % videos.length;
  const nextIndex = (activeIndex + 1) % videos.length;

  const productRedirectUrl = currentVideo.product
    ? `/shop-details?id=${currentVideo.product._id}`
    : "/shop-with-sidebar";

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex flex-col lg:flex-row h-auto lg:min-h-[540px] w-full select-none items-center justify-between overflow-visible rounded-[16px] py-4 lg:py-8 gap-8 lg:gap-10 transition-all duration-300"
    >
      {/* Dynamic Keyframes for Content transition */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* LEFT SIDE: Cinematic 3D Deck Carousel */}
      <div className="relative z-10 flex h-[440px] lg:h-[500px] w-full lg:w-[54%] items-center justify-center [perspective:1000px]">

        {/* PREVIOUS CARD PREVIEW (Desktop Only - Avoids duplicates in 2-video arrays) */}
        {videos.length > 2 && (
          <div
            onClick={handlePrev}
            onMouseEnter={() => setIsLeftHovered(true)}
            onMouseLeave={() => setIsLeftHovered(false)}
            className="absolute left-6 lg:left-12 hidden md:block h-[380px] w-[110px] shrink-0 rounded-xl overflow-hidden opacity-45 cursor-pointer border border-white/5 transition-all duration-500 hover:opacity-85 select-none"
            style={{
              transform: isLeftHovered
                ? "rotateY(10deg) scale(0.9) translateZ(-20px) translateX(-5%)"
                : "rotateY(20deg) scale(0.85) translateZ(-50px) translateX(-10%)",
            }}
          >
            <img
              src={getThumbnailUrl(videos[prevIndex])}
              alt=""
              className="h-full w-full object-cover filter brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
        )}

        {/* ACTIVE MAIN CARD (Center) */}
        <div
          id="active-video-card-container"
          key={currentVideo._id}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex h-full w-full max-w-[260px] sm:max-w-[280px] flex-col rounded-2xl border border-white/15 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(59,130,246,0.15)] overflow-hidden transition-all duration-500 animate-fadeInUp"
          style={{
            transform: isHovered ? "scale(1.03) translateZ(10px)" : "scale(1) translateZ(0)",
          }}
        >
          {/* Top Instagram-Style Progress Indicator Header */}
          <div className="absolute top-3 inset-x-0 z-40 px-3 flex gap-1 bg-gradient-to-b from-black/60 to-transparent pb-4">
            {videos.map((v, i) => (
              <div key={v._id} className="h-[4px] flex-1 bg-white/20 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-blue shadow-[0_0_8px_#3b82f6] transition-all duration-100 ease-linear"
                  style={{
                    width: `${i === activeIndex ? progress : i < activeIndex ? 100 : 0}%`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Inner Video Stream Panel */}
          <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
            {/* Mobile gesture cover overlay to block iframe touch capture and allow swipes / play toggles */}
            <div
              className="absolute inset-0 z-20 cursor-pointer lg:hidden"
              onClick={(e) => {
                e.stopPropagation();
                if (swipeOccurred.current) return;
                setIsPlaying(!isPlaying);
              }}
            />

            {/* Cinematic top & bottom dark masking gradients to block YouTube header/footer controls */}
            <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

            {getYoutubeId(currentVideo.url) || getInstagramId(currentVideo.url) ? (
              <iframe
                id="active-youtube-iframe"
                src={getEmbedUrl(currentVideo)}
                className="h-full w-full object-cover"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title={currentVideo.title}
              />
            ) : (
              <video
                ref={videoRef}
                src={currentVideo.url}
                autoPlay
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover"
                onTimeUpdate={(e) => {
                  const target = e.currentTarget;
                  if (target.duration) {
                    setProgress((target.currentTime / target.duration) * 100);
                  }
                }}
                onEnded={() => {
                  handleNext();
                }}
              />
            )}
          </div>

          {/* Micro-Interaction Controller Overlay (Shown on Hover / Touch) */}
          <div
            className={`absolute inset-0 z-35 flex items-center justify-center gap-4 bg-black/45 backdrop-blur-[1px] transition-all duration-300 ${isHovered ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause size={20} weight="bold" /> : <Play size={20} weight="fill" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? (
                <SpeakerSimpleX size={20} weight="bold" />
              ) : (
                <SpeakerSimpleHigh size={20} weight="bold" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              <ArrowsOut size={20} weight="bold" />
            </button>
          </div>

          {/* Floating Audio Mute/Unmute Icon (Direct bottom-right video overlay, adjusted for mobile/desktop layout heights) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="absolute right-3.5 bottom-20 lg:bottom-4 z-35 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/15 text-white backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-black/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <SpeakerSimpleX size={18} weight="bold" />
            ) : (
              <SpeakerSimpleHigh size={18} weight="bold" />
            )}
          </button>

          {/* Mobile-Only Bottom Mini Link Badge Overlay (Hidden on desktop sidebar panel) */}
          <Link
            href={productRedirectUrl}
            className="absolute inset-x-0 bottom-0 z-25 flex items-center justify-between bg-black/85 border-t border-white/10 p-3 text-left lg:hidden"
          >
            <div className="flex items-center gap-3 min-w-0">
              {currentVideo.product && (
                <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-slate-900">
                  <img
                    src={getProductImage(currentVideo.product)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-xs font-black text-white truncate leading-tight">{currentVideo.title}</h3>
                {currentVideo.product && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-blue">₹{currentVideo.product.price}</span>
                    {currentVideo.product.compareAtPrice && currentVideo.product.compareAtPrice > currentVideo.product.price && (
                      <span className="text-[9px] text-white/30 line-through">₹{currentVideo.product.compareAtPrice}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] font-bold text-white bg-blue px-3 py-1.5 rounded-md shrink-0 ease-out duration-150 hover:bg-blue-dark">
              Shop Now
            </span>
          </Link>
        </div>

        {/* NEXT CARD PREVIEW (Desktop Only) */}
        {videos.length > 1 && (
          <div
            onClick={handleNext}
            onMouseEnter={() => setIsRightHovered(true)}
            onMouseLeave={() => setIsRightHovered(false)}
            className="absolute right-6 lg:right-12 hidden md:block h-[380px] w-[110px] shrink-0 rounded-xl overflow-hidden opacity-45 cursor-pointer border border-white/5 transition-all duration-500 hover:opacity-85 select-none"
            style={{
              transform: isRightHovered
                ? "rotateY(-10deg) scale(0.9) translateZ(-20px) translateX(5%)"
                : "rotateY(-20deg) scale(0.85) translateZ(-50px) translateX(10%)",
            }}
          >
            <img
              src={getThumbnailUrl(videos[nextIndex])}
              alt=""
              className="h-full w-full object-cover filter brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
        )}

        {/* Carousel Click Side Navigation Arrows (Floating cleanly on the outer edges) */}
        {videos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-[6px] lg:left-[16px] top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-3 bg-white text-dark shadow-md hover:bg-gray-1 hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer"
              aria-label="Previous Demo"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-[6px] lg:right-[16px] top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-3 bg-white text-dark shadow-md hover:bg-gray-1 hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer"
              aria-label="Next Demo"
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </>
        )}
      </div>

      {/* RIGHT SIDE: Premium Product Information Panel (Animate-on-Change) */}
      <div className="relative z-10 flex w-full lg:w-[45%] h-auto justify-center items-center gap-6 p-2 sm:p-4 md:p-6 lg:p-4">
        {currentVideo.product ? (
          <>
            {/* Product Image Thumbnails (Vertical Strip) */}
            <div className="hidden md:flex flex-col gap-3">
              {currentVideo.product.images && currentVideo.product.images.length > 0 ? (
                currentVideo.product.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative h-16 w-16 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:border-blue-300 transition-colors cursor-pointer">
                    <img
                      src={img.url}
                      alt={img.alt || currentVideo.product?.title}
                      className="h-full w-full object-cover"
                    />
                    {idx === 3 && currentVideo.product!.images!.length > 4 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-gray-800 font-bold text-sm">+{currentVideo.product!.images!.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative h-16 w-16 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center">
                  <img
                    src={getProductImage(currentVideo.product)}
                    alt={currentVideo.product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div key={currentVideo._id} className="animate-fadeInUp flex-1 flex flex-col h-full justify-center gap-4">

              {/* Header Block: Badges & Ratings */}
              <div className="flex flex-col items-start gap-4">
                <span className="flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm text-gray-700 font-bold text-[11px] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  🔥 {getDynamicBadge(currentVideo.product) === "Hot Deal" ? "HOT DEAL" : getDynamicBadge(currentVideo.product)}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">{renderRatingStars(currentVideo.product.ratings?.average)}</div>
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="text-sm font-bold text-[#2B355A]">
                      {currentVideo.product.ratings?.average || 4.8}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      ({currentVideo.product.ratings?.count || 12} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Title and description flow */}
              <div className="flex flex-col gap-1 mt-1">
                <h2 className="text-[#2B355A] text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
                  {currentVideo.product.title.replace(/\s*\(.*\)\s*/, '')}
                </h2>
                {currentVideo.product.title.includes('(') ? (
                  <h3 className="text-[#845EC2] text-xl sm:text-2xl font-bold tracking-tight uppercase">
                    ({currentVideo.product.title.split('(')[1].split(')')[0]})
                  </h3>
                ) : (
                  /* Fallback for the specific design if the product doesn't have a variant in title */
                  currentVideo.product.title.toLowerCase().includes('umbrella') && (
                    <h3 className="text-[#845EC2] text-xl sm:text-2xl font-bold tracking-tight uppercase">
                      (MIX COLOR)
                    </h3>
                  )
                )}

                <p className="text-[#64748B] text-[13px] sm:text-sm leading-relaxed line-clamp-4 font-medium mt-2">
                  {currentVideo.product.description || "Add a touch of style and functionality to your daily commute with the Bottle Umbrella, available in a mix of vibrant colors. This innovative accessory combines a compact umbrella with a water bottle holder, keeping you..."}
                </p>
              </div>

              {/* Stock Warning Badge */}
              <div className="inline-flex mt-2">
                {currentVideo.product.stock && currentVideo.product.stock < 12 ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-transparent px-3 py-1.5 rounded-[4px] border border-gray-400">
                    ONLY {currentVideo.product.stock} LEFT - ORDER FAST!
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-transparent px-3 py-1.5 rounded-[4px] border border-gray-400">
                    IN STOCK • READY TO SHIP
                  </span>
                )}
              </div>

              {/* Price block */}
              <div className="flex flex-col mt-2">
                <p className="text-[12px] text-gray-500 mb-0.5 font-medium">Special Price</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-[#2B355A] leading-none">₹{currentVideo.product.price}</span>
                  {currentVideo.product.compareAtPrice && currentVideo.product.compareAtPrice > currentVideo.product.price && (
                    <>
                      <span className="text-gray-500 line-through text-[15px] font-bold">
                        ₹{currentVideo.product.compareAtPrice}
                      </span>
                      <span className="text-[10px] font-bold text-[#FF497C] bg-[#FFF0F4] px-2.5 py-1 rounded-[4px] ml-1 uppercase">
                        {getDiscountPercent(currentVideo.product.price, currentVideo.product.compareAtPrice)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 w-full mt-4 pb-2">
                <button
                  onClick={(e) => handleAddToCartFlow(e, currentVideo.product!)}
                  className="flex-1 inline-flex items-center justify-center gap-2 font-bold text-white bg-[#3B5998] py-3.5 px-6 rounded-md ease-out duration-200 hover:bg-[#2b4273] cursor-pointer text-sm shadow-sm transition-all duration-150"
                >
                  <ShoppingCart size={18} weight="fill" />
                  Buy Now
                </button>
                <Link
                  href={productRedirectUrl}
                  className="flex-[0.85] inline-flex items-center justify-center gap-2 font-bold text-[#3B4149] bg-white py-3.5 px-6 rounded-md ease-out duration-200 hover:bg-gray-50 cursor-pointer text-sm transition-all duration-150 border border-gray-300 shadow-sm"
                >
                  View Details
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-gray-400 py-10">
            <ShoppingCart size={40} weight="thin" className="mb-2 text-gray-300" />
            <p className="text-xs font-medium">No linked product configured</p>
          </div>
        )}
      </div>

    </div>
  );
}
