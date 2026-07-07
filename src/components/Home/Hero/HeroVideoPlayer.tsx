"use client";
import { useUI } from "@/app/context/UIContext";
import { addItemToCart } from "@/redux/features/cart-slice";
import { AppDispatch } from "@/redux/store";
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  Pause,
  Play,
  ShoppingCart,
  Sparkle,
  SpeakerSimpleHigh,
  SpeakerSimpleX,
  Star
} from "@phosphor-icons/react";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

//-----------------------------------------
// Types & Interfaces
//-----------------------------------------
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

//-----------------------------------------
// Helper Parsing Utilities
//-----------------------------------------
const getYoutubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

const getInstagramId = (url: string): string => {
  const match = url.match(/(?:instagram\.com\/reel\/)([^/?#]+)/);
  return match && match[1] ? match[1] : "";
};

const getEmbedUrl = (video: HeroVideo): string => {
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

const getThumbnailUrl = (video: HeroVideo): string => {
  const ytId = getYoutubeId(video.url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return "/images/placeholder.png";
};

const getProductImage = (product?: Product): string => {
  if (!product || !product.images || product.images.length === 0) return "/images/placeholder.png";
  const featured = product.images.find((img) => img.isFeatured);
  return featured?.url || product.images[0].url || "/images/placeholder.png";
};

export default function HeroVideoPlayer() {
  const dispatch = useDispatch<AppDispatch>();
  const { openCartSidebar } = useUI();

  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const sendYoutubeCommand = useCallback((func: string) => {
    try {
      const iframe = document.getElementById("hero-main-yt-iframe") as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: func, args: "" }),
          "*"
        );
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Sync Video Controls
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
    sendYoutubeCommand(isPlaying ? "playVideo" : "pauseVideo");
  }, [isPlaying, activeIndex, sendYoutubeCommand]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
    sendYoutubeCommand(isMuted ? "mute" : "unMute");
  }, [isMuted, activeIndex, sendYoutubeCommand]);

  // Load Video Content Array
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/hero-videos");
        const resData = await res.json();

        if (resData.success && resData.data?.length > 0) {
          setVideos(resData.data);
        } else {
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
              product: p ? {
                _id: p._id,
                title: p.title,
                price: p.price,
                compareAtPrice: p.compareAtPrice,
                description: p.description,
                stock: p.stock,
                ratings: p.ratings || { average: 4.7, count: 32 },
                images: p.images,
              } : undefined,
            };
          });
          setVideos(fallbacks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || videos.length === 0) {
    return (
      <div className="w-full h-[540px] lg:h-full rounded-lg bg-[#ffffff] flex items-center justify-center border border-[#e0e0e0] shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue border-t-transparent" />
          <p className="text-xs font-semibold text-dark-3 uppercase tracking-wider">Loading Showcase...</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[activeIndex];
  const product = currentVideo.product;
  const productUrl = product ? `/shop-details?id=${product._id}` : "/shop";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;
    dispatch(addItemToCart({ _id: product._id, quantity: 1 }));
    openCartSidebar();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 font-sans lg:h-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#ffffff] border border-[#e0e0e0] rounded-lg p-2 items-stretch shadow-sm lg:h-full">
        
        {/* 1. LEFT CONTAINER: Main Active Video Player & Controller (Grid Span 4) */}
        <div className="lg:col-span-4 lg:h-full lg:min-h-0 lg:flex lg:items-center lg:justify-center">
          <div className="w-full aspect-[9/16] lg:h-full lg:w-[calc((100vh-178px)*9/16)] bg-black rounded-lg border border-[#e0e0e0] overflow-hidden relative shadow-inner">
            
            {/* Interactive Player Frame Canvas */}
            <div className="w-full h-full relative overflow-hidden" onClick={() => setIsPlaying(!isPlaying)}>
              {getYoutubeId(currentVideo.url) || getInstagramId(currentVideo.url) ? (
                <iframe
                  id="hero-main-yt-iframe"
                  src={getEmbedUrl(currentVideo)}
                  className="w-full h-full object-cover scale-[1.22] pointer-events-none select-none"
                  allow="autoplay; encrypted-media"
                  title={currentVideo.title}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentVideo.url}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Media Overlay State Controllers */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="w-8 h-8 rounded bg-black/70 border border-white/10 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                aria-label="Mute Toggle"
              >
                {isMuted ? <SpeakerSimpleX size={14} weight="bold" /> : <SpeakerSimpleHigh size={14} weight="bold" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                className="w-8 h-8 rounded bg-black/70 border border-white/10 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                aria-label="Play Toggle"
              >
                {isPlaying ? <Pause size={14} weight="bold" /> : <Play size={14} weight="fill" />}
              </button>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE CONTAINER: Clean Product Information & Dynamic Pricing (Grid Span 8) */}
        <div className="lg:col-span-8 flex flex-col justify-between py-1 lg:h-full lg:min-h-0">
          <div className="lg:overflow-y-auto lg:pr-1 lg:flex-1 lg:min-h-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 bg-[#f5f5f5] border border-[#cccccc] text-[#000000] font-semibold text-[10px] uppercase tracking-wider rounded px-2 py-0.5">
                <Sparkle size={10} weight="fill" />
                Trending Showcase
              </span>
              {product?.stock && product.stock <= 8 && (
                <span className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Low Stock
                </span>
              )}
            </div>

            <h1 className="text-[#000000] text-2xl md:text-3xl font-bold tracking-tight mb-3 leading-tight">
              {product?.title || currentVideo.title}
            </h1>

            {product?.ratings && (
              <div className="flex items-center gap-1.5 mb-5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} weight={i < Math.round(product.ratings?.average || 5) ? "fill" : "regular"} />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#000000]">{product.ratings.average}</span>
                <span className="text-xs text-[#999999]">({product.ratings.count} reviews)</span>
              </div>
            )}

            <p className="text-[#666666] text-xs md:text-sm leading-relaxed font-normal mb-6">
              {product?.description || "Watch the live presentation video. Purchase directly from our seasonal trending catalog below with full verified tracking updates."}
            </p>
          </div>

          {/* Action Interaction Pricing Row */}
          {product && (
            <div className="border-t border-[#e0e0e0] pt-5 mt-4">
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl font-bold text-[#000000] tracking-tight">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-sm text-[#999999] line-through font-medium">
                      ₹{product.compareAtPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] font-bold text-[10px] px-2 py-0.5 rounded">
                      {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#293681] text-white border border-blue font-semibold text-xs uppercase tracking-wider rounded py-3 px-4 flex items-center justify-center gap-2 hover:bg-[#293681] hover:border-blue-dark transition-colors active:scale-[0.99]"
                >
                  <ShoppingCart size={14} weight="bold" />
                  Add to Cart
                </button>
                <Link
                  href={productUrl}
                  className="flex-1 bg-transparent text-[#293681] border border-[#293681] font-semibold text-xs uppercase tracking-wider rounded py-3 px-4 flex items-center justify-center gap-1 hover:bg-blue hover:text-white transition-colors active:scale-[0.99]"
                >
                  View Details
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Left Arrow Navigation */}
      {videos.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-[-8px] lg:left-[-24px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border border-[#e0e0e0] shadow-md flex items-center justify-center text-black hover:bg-[#f5f5f5] hover:border-[#cccccc] active:scale-95 transition-all"
          aria-label="Previous Video"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
      )}

      {/* Right Arrow Navigation */}
      {videos.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-[-8px] lg:right-[-24px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border border-[#e0e0e0] shadow-md flex items-center justify-center text-black hover:bg-[#f5f5f5] hover:border-[#cccccc] active:scale-95 transition-all"
          aria-label="Next Video"
        >
          <CaretRight size={20} weight="bold" />
        </button>
      )}
    </div>
  );
}