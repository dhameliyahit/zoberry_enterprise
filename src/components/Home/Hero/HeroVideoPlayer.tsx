"use client";
import { useUI } from "@/app/context/UIContext";
import { addItemToCart } from "@/redux/features/cart-slice";
import { AppDispatch } from "@/redux/store";
import {
  ArrowRight,
  Pause,
  Play,
  ShoppingCart,
  SpeakerSimpleHigh,
  SpeakerSimpleX,
  Star,
  FireSimple,
  Lightning,
  ShieldCheck,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
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
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
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
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return "/images/placeholder.png";
};

const getProductImage = (product?: Product): string => {
  if (!product?.images?.length) return "/images/placeholder.png";
  const featured = product.images.find((img) => img.isFeatured);
  return featured?.url || product.images[0].url || "/images/placeholder.png";
};

export default function HeroVideoPlayer() {
  const dispatch = useDispatch<AppDispatch>();
  const { openCartSidebar, setHomeLoading } = useUI();

  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const sendYoutubeCommand = useCallback((func: string) => {
    try {
      const iframe = document.getElementById("hero-main-yt-iframe") as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args: "" }),
          "*"
        );
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

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
        setHomeLoading(false);
      }
    };
    loadData();
  }, [setHomeLoading]);

  const switchVideo = (idx: number) => {
    if (idx === activeIndex) return;
    setIsChanging(true);
    setTimeout(() => {
      setActiveIndex(idx);
      setIsChanging(false);
    }, 250);
  };

  // Skeleton Loader
  if (loading) {
    return (
      <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8 animate-pulse">
        {/* Video skeleton */}
        <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0">
          <div className="w-full aspect-[9/16] lg:aspect-auto lg:h-[540px] bg-gray-2 rounded-2xl" />
        </div>
        {/* Info skeleton */}
        <div className="flex-1 flex flex-col gap-4 py-4">
          <div className="h-5 w-28 bg-gray-2 rounded-full" />
          <div className="h-10 w-3/4 bg-gray-2 rounded-lg" />
          <div className="h-4 w-48 bg-gray-2 rounded-full" />
          <div className="h-4 w-full bg-gray-2 rounded" />
          <div className="h-4 w-5/6 bg-gray-2 rounded" />
          <div className="h-4 w-4/6 bg-gray-2 rounded" />
          <div className="mt-auto pt-6 border-t border-gray-2">
            <div className="h-10 w-32 bg-gray-2 rounded-lg mb-4" />
            <div className="flex gap-3">
              <div className="h-12 flex-1 bg-gray-2 rounded-xl" />
              <div className="h-12 flex-1 bg-gray-2 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) return null;

  const currentVideo = videos[activeIndex];
  const product = currentVideo.product;
  const productUrl = product ? `/shop-details?id=${product._id}` : "/shop";
  const discount = product?.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;
    dispatch(addItemToCart({ _id: product._id, quantity: 1 }));
    openCartSidebar();
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-14 items-start">

      {/* =============================================
          LEFT: Phone-Frame Styled Video Player
      ============================================= */}
      <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col gap-4">

        {/* Video Frame */}
        <div className="relative group">

          {/* Outer Glow Ring */}
          <div className="absolute -inset-[3px] rounded-[28px] bg-gradient-to-b from-blue/30 via-blue-dark/20 to-transparent opacity-70 blur-sm" />

          {/* Phone Frame */}
          <div className="relative w-full aspect-[9/16] bg-black rounded-[24px] overflow-hidden shadow-2xl border border-white/10">

            {/* Video content */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${isChanging ? "opacity-0" : "opacity-100"}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {getYoutubeId(currentVideo.url) || getInstagramId(currentVideo.url) ? (
                <iframe
                  id="hero-main-yt-iframe"
                  src={getEmbedUrl(currentVideo)}
                  className="w-full h-full scale-[1.22] pointer-events-none select-none"
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

            {/* Top gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

            {/* Top: Brand tag */}
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                Live Trending
              </span>
            </div>

            {/* Bottom: Controls */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between">
              {/* Slide indicator dots */}
              <div className="flex gap-1.5">
                {videos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); switchVideo(idx); }}
                    className={`rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? "w-5 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to video ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Play / Mute buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-all active:scale-95"
                  aria-label="Mute Toggle"
                >
                  {isMuted ? <SpeakerSimpleX size={13} weight="bold" /> : <SpeakerSimpleHigh size={13} weight="bold" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                  className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-all active:scale-95"
                  aria-label="Play Toggle"
                >
                  {isPlaying ? <Pause size={13} weight="bold" /> : <Play size={13} weight="fill" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {videos.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {videos.map((vid, idx) => (
              <button
                key={vid._id}
                onClick={() => switchVideo(idx)}
                className={`relative shrink-0 w-16 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  idx === activeIndex
                    ? "border-blue shadow-md scale-[1.04]"
                    : "border-transparent opacity-60 hover:opacity-90 hover:scale-[1.02]"
                }`}
              >
                <Image
                  src={getThumbnailUrl(vid)}
                  alt={vid.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {idx === activeIndex && (
                  <div className="absolute inset-0 bg-blue/20" />
                )}
                {/* Play icon overlay on inactive */}
                {idx !== activeIndex && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <Play size={10} weight="fill" className="text-white ml-0.5" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =============================================
          RIGHT: Product Info Panel
      ============================================= */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${isChanging ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>

        {/* Badge Row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 bg-blue/8 border border-blue/20 text-blue font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
            <FireSimple size={11} weight="fill" />
            Trending Now
          </span>
          {product?.stock && product.stock <= 8 && (
            <span className="inline-flex items-center gap-1 bg-red-light-6 border border-red-light-3 text-red font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
              <Lightning size={11} weight="fill" />
              Only {product.stock} left
            </span>
          )}
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 bg-green-light-3/30 border border-green-light-2 text-green-dark font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
              {discount}% OFF Today
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-dark text-2xl sm:text-3xl xl:text-[2.1rem] font-bold leading-tight tracking-tight mb-4 max-w-[520px]">
          {product?.title || currentVideo.title}
        </h1>

        {/* Star Rating */}
        {product?.ratings && (
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  weight={i < Math.round(product.ratings?.average || 5) ? "fill" : "regular"}
                  className="text-amber-400"
                />
              ))}
            </div>
            <span className="text-sm font-bold text-dark">{product.ratings.average}</span>
            <span className="text-xs text-dark-4">({product.ratings.count} verified reviews)</span>
          </div>
        )}

        {/* Description */}
        <p className="text-dark-3 text-sm leading-relaxed mb-7 max-w-[480px]">
          {product?.description
            ? product.description.slice(0, 200) + (product.description.length > 200 ? "..." : "")
            : "Discover this trending product featured in our curated showcase. Shop directly with guaranteed quality and fast delivery across India."}
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-3 mb-7">
          {[
            { icon: <ShieldCheck size={13} weight="fill" className="text-green" />, label: "100% Secure Checkout" },
            { icon: <Lightning size={13} weight="fill" className="text-blue" />, label: "Fast Dispatch" },
          ].map((badge, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs text-dark-3 bg-gray-1 border border-gray-3 px-3 py-1.5 rounded-full">
              {badge.icon}
              {badge.label}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-gray-3 via-gray-2 to-transparent mb-6" />

        {/* Price Block */}
        {product && (
          <>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-blue-dark tracking-tight">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-base text-dark-4 line-through font-medium">
                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="inline-flex items-center bg-red-light-5 border border-red-light-3 text-red text-xs font-bold px-2.5 py-1 rounded-lg">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="group flex-1 bg-blue-dark text-white font-bold text-sm rounded-xl py-3.5 px-6 flex items-center justify-center gap-2.5 hover:bg-brand-navy transition-all duration-200 active:scale-[0.98] shadow-md shadow-blue-dark/20 hover:shadow-lg hover:shadow-blue-dark/30"
              >
                <ShoppingCart size={16} weight="bold" className="transition-transform duration-200 group-hover:-rotate-6" />
                Add to Cart
              </button>
              <Link
                href={productUrl}
                className="group flex-1 bg-white text-blue-dark border-2 border-blue-dark font-bold text-sm rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 hover:bg-blue-dark hover:text-white transition-all duration-200 active:scale-[0.98]"
              >
                View Details
                <ArrowRight size={15} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </>
        )}

        {/* No Product – CTA fallback */}
        {!product && (
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-blue-dark text-white font-bold text-sm rounded-xl py-3.5 px-7 hover:bg-brand-navy transition-all duration-200 active:scale-[0.98] shadow-md shadow-blue-dark/20 mt-2"
          >
            Browse Collection
            <ArrowRight size={15} weight="bold" />
          </Link>
        )}

        {/* Video navigation counter */}
        {videos.length > 1 && (
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-2">
            <span className="text-xs text-dark-4 font-medium">
              Video {activeIndex + 1} of {videos.length}
            </span>
            <div className="flex gap-1.5 ml-auto">
              <button
                onClick={() => switchVideo(activeIndex === 0 ? videos.length - 1 : activeIndex - 1)}
                className="w-8 h-8 rounded-lg border border-gray-3 bg-white text-dark-3 flex items-center justify-center hover:border-blue hover:text-blue hover:bg-blue/5 transition-all"
                aria-label="Previous video"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button
                onClick={() => switchVideo(activeIndex === videos.length - 1 ? 0 : activeIndex + 1)}
                className="w-8 h-8 rounded-lg border border-gray-3 bg-white text-dark-3 flex items-center justify-center hover:border-blue hover:text-blue hover:bg-blue/5 transition-all"
                aria-label="Next video"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}