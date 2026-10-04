import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiStar, FiShoppingCart, FiArrowRight, FiTrendingUp } from 'react-icons/fi';

const Hero = () => {
  const [currentSlide] = useState(0);

  return (
    // We use calc(100vh - 115px) because Topbar (40px) + Header (~75px) = 115px
    <section className="relative bg-[#f8fafc] w-full flex items-center justify-center overflow-hidden" 
      style={{ height: 'calc(100vh - 115px)', minHeight: '500px' }}
    >
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f8fafc] -z-10" />

      {/* Main Slider Arrows (Outer) */}
      <button className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 slider-arrow hidden sm:flex">
        <FiChevronLeft size={24} />
      </button>

      <button className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 slider-arrow hidden sm:flex">
        <FiChevronRight size={24} />
      </button>

      {/* The Product Card Container - Using h-auto and max-h to prevent ugly internal scrolling */}
      <div className="w-full max-w-[1050px] max-h-[90%] mx-4 sm:mx-24 bg-white rounded border border-gray-200 shadow-xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Side: Video (35% width) */}
        <div className="w-full md:w-[35%] relative bg-gray-100 flex-shrink-0 min-h-[300px] md:min-h-0">
          <video 
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
            src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          />
        </div>

        {/* Right Side: Product Details (65% width) - Removed overflow-y-auto so it doesn't scroll */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white">
          
          {/* Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700 bg-gray-100 border border-gray-200 rounded-sm">
              <FiTrendingUp size={12} className="text-primary" />
              Trending Showcase
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-secondary leading-tight mb-2 uppercase tracking-tight">
            Bottle Umbrella (Mix Color)
          </h1>

          {/* Reviews */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-[#0f4c81]">
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar key={star} size={14} fill="currentColor" />
              ))}
            </div>
            <span className="text-xs font-bold text-gray-700">5</span>
            <span className="text-xs text-gray-400">(2 reviews)</span>
          </div>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Add a touch of style and functionality to your daily commute with the Bottle Umbrella. This innovative accessory combines a compact umbrella with a water bottle holder, keeping you dry and hydrated on-the-go. The umbrella features a sturdy steel frame, waterproof canopy, and a comfortable grip handle.
          </p>

          <div className="w-full h-px bg-gray-100 mb-6"></div>

          {/* Price & Discounts */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-extrabold text-secondary leading-none">Rs. 299</span>
            <span className="text-base text-gray-400 line-through mb-0.5">Rs. 399</span>
            <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-sm mb-1 uppercase">
              100% OFF
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <button className="flex-1 btn-primary">
              <FiShoppingCart size={16} />
              Add to Cart
            </button>
            <button className="flex-1 btn-outline">
              View Details
              <FiArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
