import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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
      <section className="w-full py-8 md:py-12 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-xs">
            <Skeleton className="w-full md:w-1/2 aspect-square rounded-xl" />
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="w-28 h-6 rounded-full" />
                <Skeleton className="w-3/4 h-8" />
                <Skeleton className="w-full h-16" />
              </div>
              <div className="space-y-4">
                <Skeleton className="w-36 h-8" />
                <div className="flex gap-3">
                  <Skeleton className="flex-1 h-11 rounded-lg" />
                  <Skeleton className="flex-1 h-11 rounded-lg" />
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
      <section className="w-full py-16 px-4 bg-slate-50 flex items-center justify-center">
        <div className="max-w-xl text-center space-y-4">
          <Badge variant="primary" size="md">
            Direct Warehouse Value
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Smart Home Utilities & Daily Essentials
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Discover curated problem-solving gadgets, kitchen organizers, and daily life essentials at direct prices.
          </p>
          <div className="pt-2">
            <Link to="/products">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore All Products
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
    <section className="relative w-full py-6 md:py-10 bg-slate-50 border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-5xl relative">
        {/* Carousel Prev/Next Buttons */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous spotlight"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-5 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-primary hover:border-slate-300 transition-all hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next spotlight"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-5 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-primary hover:border-slate-300 transition-all hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Media / Image */}
          <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[380px] lg:min-h-[420px] bg-slate-100 relative overflow-hidden flex items-center justify-center">
            <img
              src={mainImage}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="success" size="md">
                  {discountPercent}% OFF
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm" dot>
                  <Sparkles className="w-3 h-3 text-primary inline mr-1" />
                  {currentProduct.optionsLabel || 'Trending Spotlight'}
                </Badge>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {currentProduct.name}
              </h1>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                {currentProduct.shortDescription ||
                  'Engineered for maximum daily utility, durability, and practical problem-solving in modern homes.'}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ₹{Number(currentProduct.price).toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{Number(currentProduct.compareAtPrice).toLocaleString('en-IN')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-semibold text-emerald-700">
                    Save ₹{Number(currentProduct.compareAtPrice - currentProduct.price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleHeroAddToCart}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  {currentProduct.hasVariants ? 'Select Options' : 'Add to Cart'}
                </Button>
                <Link to={`/product/${currentProduct.slug}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {products.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentSlide % totalSlides === idx
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;
