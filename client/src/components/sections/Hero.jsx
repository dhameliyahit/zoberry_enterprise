import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { FiChevronLeft, FiChevronRight, FiShoppingCart, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';
import { GET_ALL_PRODUCTS } from '../../graphql/products';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const Hero = () => {
  const { data, loading } = useQuery(GET_ALL_PRODUCTS, {
    variables: { limit: 5 },
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const { openCart } = useUIStore();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const products = (data?.getAllProducts || []).filter((p) => p.isActive !== false);

  if (loading) {
    return (
      <section className="relative bg-[#f8fafc] w-full min-h-[420px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="relative bg-[#f8fafc] w-full py-16 px-4 flex items-center justify-center">
        <div className="max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-3 py-1 rounded">
            Welcome to Zoberry Enterprise
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-secondary mt-4 mb-4 tracking-tight">
            Smart Home Utilities & Daily Essentials
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-8">
            Explore our curated catalog of problem-solving kitchenware, organizers, and home utilities.
          </p>
          <Link to="/products" className="btn-primary inline-flex text-xs tracking-wider">
            Explore All Products <FiArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  const currentProduct = products[currentSlide % products.length];
  const totalSlides = products.length;

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const rawImage = currentProduct.images && currentProduct.images.length > 0 ? currentProduct.images[0] : null;
  const mainImage = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `${API_URL}${rawImage}`)
    : 'https://placehold.co/600x600?text=Product+Image';

  let discount = 0;
  if (currentProduct.compareAtPrice && currentProduct.compareAtPrice > currentProduct.price) {
    discount = Math.round(
      ((currentProduct.compareAtPrice - currentProduct.price) / currentProduct.compareAtPrice) * 100
    );
  }

  const handleHeroAddToCart = async () => {
    if (currentProduct.hasVariants) {
      navigate(`/product/${currentProduct.slug}`);
      return;
    }
    try {
      await addToCart(currentProduct.id, null, 1);
      openCart();
    } catch (err) {
      // Toast handled
    }
  };

  return (
    <section className="relative bg-[#f8fafc] w-full py-8 md:py-12 flex items-center justify-center overflow-hidden">
      {/* Slider Controls */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 slider-arrow hidden sm:flex"
            aria-label="Previous product"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 slider-arrow hidden sm:flex"
            aria-label="Next product"
          >
            <FiChevronRight size={20} />
          </button>
        </>
      )}

      {/* Main Showcase Card */}
      <div className="w-full max-w-5xl mx-4 sm:mx-16 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: Image / Media */}
        <div className="w-full md:w-5/12 relative bg-gray-50 shrink-0 min-h-[280px] md:min-h-[420px] flex items-center justify-center overflow-hidden">
          <img
            src={mainImage}
            alt={currentProduct.name}
            className="w-full h-full object-cover"
          />
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-blue-50 rounded">
                <FiTrendingUp size={12} />
                {currentProduct.optionsLabel || 'Featured Spotlight'}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-secondary leading-tight mb-3">
              {currentProduct.name}
            </h2>

            <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6 line-clamp-3">
              {currentProduct.shortDescription || 'Experience premium quality and practical utility engineered for daily convenience.'}
            </p>
          </div>

          <div>
            {/* Price & Discounts */}
            <div className="flex items-baseline gap-3 mb-6 pt-4 border-t border-gray-100">
              <span className="text-2xl md:text-3xl font-extrabold text-secondary">
                Rs. {currentProduct.price?.toLocaleString()}
              </span>
              {currentProduct.compareAtPrice > currentProduct.price && (
                <span className="text-base text-gray-400 line-through">
                  Rs. {currentProduct.compareAtPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleHeroAddToCart} className="flex-1 btn-primary text-xs">
                <FiShoppingCart size={15} />
                {currentProduct.hasVariants ? 'Select Options' : 'Add to Cart'}
              </button>
              <Link to={`/product/${currentProduct.slug}`} className="flex-1 btn-outline text-xs">
                View Details
                <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
