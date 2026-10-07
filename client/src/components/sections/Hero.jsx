import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { FiChevronLeft, FiChevronRight, FiStar, FiShoppingCart, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';

const GET_HERO_PRODUCTS = gql`
  query GetHeroProducts {
    getAllProducts {
      id
      name
      slug
      shortDescription
      description
      price
      compareAtPrice
      images
      stockQuantity
      optionsLabel
      productVideoUrl
      isActive
    }
  }
`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const Hero = () => {
  const { data } = useQuery(GET_HERO_PRODUCTS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { openCart } = useUIStore();

  const products = (data?.getAllProducts || []).filter(p => p.isActive !== false);

  const fallbackProduct = {
    id: 'demo-1',
    name: 'Bottle Umbrella (Mix Color)',
    slug: 'bottle-umbrella-mix-color',
    shortDescription: 'Add a touch of style and functionality to your daily commute with the Bottle Umbrella. This innovative accessory combines a compact umbrella with a water bottle holder, keeping you dry and hydrated on-the-go. The umbrella features a sturdy steel frame, waterproof canopy, and a comfortable grip handle.',
    price: 299,
    compareAtPrice: 399,
    optionsLabel: 'Trending Showcase',
    productVideoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    images: []
  };

  const currentProduct = products.length > 0 ? products[currentSlide % products.length] : fallbackProduct;
  const totalSlides = products.length > 0 ? products.length : 1;

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  const rawImage = currentProduct.images && currentProduct.images.length > 0 ? currentProduct.images[0] : null;
  const mainImage = rawImage 
    ? (rawImage.startsWith('http') ? rawImage : `${API_URL}${rawImage}`) 
    : 'https://placehold.co/600x600?text=Product+Image';

  // Calculate discount
  let discount = 0;
  if (currentProduct.compareAtPrice && currentProduct.compareAtPrice > currentProduct.price) {
    discount = Math.round(((currentProduct.compareAtPrice - currentProduct.price) / currentProduct.compareAtPrice) * 100);
  }

  // YouTube embed URL helper (hidden controls)
  const isEmbedVideo = currentProduct.productVideoUrl && (
    currentProduct.productVideoUrl.includes('youtube') || 
    currentProduct.productVideoUrl.includes('youtu.be')
  );

  const getEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
    else if (url.includes('shorts/')) videoId = url.split('shorts/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&playsinline=1`;
  };

  return (
    // We use calc(100vh - 115px) because Topbar (40px) + Header (~75px) = 115px
    <section className="relative bg-[#f8fafc] w-full flex items-center justify-center overflow-hidden" 
      style={{ height: 'calc(100vh - 115px)', minHeight: '500px' }}
    >
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f8fafc] -z-10" />

      {/* Main Slider Arrows (Outer) */}
      {totalSlides > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 slider-arrow hidden sm:flex cursor-pointer"
            aria-label="Previous product"
          >
            <FiChevronLeft size={24} />
          </button>

          <button 
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 slider-arrow hidden sm:flex cursor-pointer"
            aria-label="Next product"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* The Product Card Container - Using h-auto and max-h to prevent ugly internal scrolling */}
      <div className="w-full max-w-[1050px] max-h-[90%] mx-4 sm:mx-24 bg-white rounded border border-gray-200 shadow-xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Side: Video / Image (35% width) */}
        <div className="w-full md:w-[35%] relative bg-gray-100 flex-shrink-0 min-h-[300px] md:min-h-0">
          {currentProduct.productVideoUrl ? (
            isEmbedVideo ? (
              <iframe
                src={getEmbedUrl(currentProduct.productVideoUrl)}
                title={currentProduct.name}
                className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                allow="autoplay; muted"
              />
            ) : (
              <video 
                key={currentProduct.id}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
                playsInline
                controls={false}
                src={currentProduct.productVideoUrl}
              />
            )
          ) : (
            <img 
              src={mainImage} 
              alt={currentProduct.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Right Side: Product Details (65% width) - Removed overflow-y-auto so it doesn't scroll */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white">
          
          {/* Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700 bg-gray-100 border border-gray-200 rounded-sm">
              <FiTrendingUp size={12} className="text-primary" />
              {currentProduct.optionsLabel || 'Trending Showcase'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-secondary leading-tight mb-2 uppercase tracking-tight">
            {currentProduct.name}
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
          <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-4">
            {currentProduct.shortDescription || currentProduct.description}
          </p>

          <div className="w-full h-px bg-gray-100 mb-6"></div>

          {/* Price & Discounts */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-extrabold text-secondary leading-none">
              Rs. {currentProduct.price?.toLocaleString()}
            </span>
            {currentProduct.compareAtPrice > currentProduct.price && (
              <span className="text-base text-gray-400 line-through mb-0.5">
                Rs. {currentProduct.compareAtPrice?.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-sm mb-1 uppercase">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <button onClick={openCart} className="flex-1 btn-primary cursor-pointer">
              <FiShoppingCart size={16} />
              Add to Cart
            </button>
            <Link to={`/product/${currentProduct.slug}`} className="flex-1 btn-outline cursor-pointer">
              View Details
              <FiArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
