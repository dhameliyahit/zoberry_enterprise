import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, Sparkles, Truck } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { GET_ALL_PRODUCTS } from '../../graphql/products';
import { getImageUrl } from '../../utils/imageUrl';

export function Hero() {
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
      <section className="w-full py-6 md:py-8 bg-slate-100/70 border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="bg-white rounded-[2px] border border-slate-200 p-6 flex flex-col md:flex-row gap-6 shadow-2xs">
            <Skeleton className="w-full md:w-5/12 aspect-square rounded-[2px]" />
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="w-24 h-5 rounded-[2px]" />
                <Skeleton className="w-3/4 h-7" />
                <Skeleton className="w-full h-12" />
              </div>
              <div className="space-y-3">
                <Skeleton className="w-32 h-7" />
                <div className="flex gap-3">
                  <Skeleton className="flex-1 h-10 rounded-[2px]" />
                  <Skeleton className="flex-1 h-10 rounded-[2px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-full py-12 px-4 bg-[#0b1528] text-white border-b border-slate-800">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-3.5">
          <span className="px-2.5 py-1 bg-blue-900/60 text-blue-300 border border-blue-700/50 text-xs font-bold uppercase tracking-wider rounded-[2px] inline-block">
            Direct Warehouse Value
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Smart Home Utilities & Kitchen Essentials
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Practical home and kitchen products engineered for daily convenience, curated and delivered across India.
          </p>
          <div className="pt-2">
            <Link to="/products">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse All Products
              </Button>
            </Link>
          </div>
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

  const mainImage =
    currentProduct.images && currentProduct.images.length > 0
      ? getImageUrl(currentProduct.images[0])
      : getImageUrl(null);

  const hasDiscount = currentProduct.compareAtPrice && currentProduct.compareAtPrice > currentProduct.price;
  const discountPercent = hasDiscount
    ? Math.round(((currentProduct.compareAtPrice - currentProduct.price) / currentProduct.compareAtPrice) * 100)
    : 0;

  const handleHeroAddToCart = async () => {
    if (currentProduct.hasVariants) {
      navigate(`/product/${currentProduct.slug}`);
      return;
    }
    try {
      await addToCart(currentProduct.id, null, 1);
      openCart();
    } catch {
      // handled
    }
  };

  return (
    <section className="relative w-full py-4 md:py-6 bg-[#f1f5f9] border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative">
        {/* Top Warehouse Header Banner Strip */}
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">Featured Spotlight</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 hidden sm:inline">Practical Problem-Solvers for Modern Homes</span>
          </div>
          <Link to="/products" className="text-primary hover:underline font-bold text-xs inline-flex items-center gap-1 uppercase tracking-wider">
            <span>Explore All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Hero Spotlight Card (Warehouse Preset) */}
        <div className="bg-white rounded-[2px] border border-slate-200 shadow-2xs overflow-hidden flex flex-col md:flex-row relative">
          
          {/* Media / Image */}
          <div className="w-full md:w-5/12 aspect-[4/3] md:aspect-auto md:min-h-[340px] bg-[#f8fafc] relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
            <img
              src={mainImage}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 bg-[#dc2626] text-white text-xs font-black uppercase tracking-wider rounded-[2px] shadow-xs">
                  SAVE {discountPercent}%
                </span>
              </div>
            )}
            
            {/* Direct Link to PDP */}
            <Link
              to={`/product/${currentProduct.slug}`}
              className="absolute inset-0 z-0"
              aria-label={`View ${currentProduct.name}`}
            />
          </div>

          {/* Details & Actions */}
          <div className="w-full md:w-7/12 p-5 sm:p-7 flex flex-col justify-between bg-white z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 text-[10px] font-bold uppercase tracking-wider rounded-[2px]">
                  {currentProduct.optionsLabel || 'Trending Daily Essential'}
                </span>
              </div>

              <Link to={`/product/${currentProduct.slug}`} className="block group">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                  {currentProduct.name}
                </h1>
              </Link>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                {currentProduct.shortDescription ||
                  'Engineered for maximum daily convenience, high durability, and practical utility in modern homes.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 mt-4 space-y-3.5">
              {/* Pricing */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ₹{Number(currentProduct.price).toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{Number(currentProduct.compareAtPrice).toLocaleString('en-IN')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-bold text-emerald-700">
                    Save ₹{Number(currentProduct.compareAtPrice - currentProduct.price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <Button
                  onClick={handleHeroAddToCart}
                  variant="primary"
                  size="md"
                  className="w-full sm:flex-1 justify-center h-10"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  {currentProduct.hasVariants ? 'Choose Options' : 'Add to Cart'}
                </Button>
                <Link to={`/product/${currentProduct.slug}`} className="w-full sm:flex-1">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center h-10"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slide Switcher */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-between mt-2.5 text-xs text-slate-500">
            <div className="flex gap-1.5 items-center">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-[1px] transition-all duration-150 ${
                    currentSlide % totalSlides === idx
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous spotlight"
                className="p-1.5 rounded-[2px] bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-slate-400 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next spotlight"
                className="p-1.5 rounded-[2px] bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-slate-400 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;
