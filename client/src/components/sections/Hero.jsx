import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
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
      <section className="w-full py-6 md:py-8 bg-slate-100/70 border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 shadow-xs">
            <Skeleton className="w-full md:w-5/12 aspect-square rounded-lg" />
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="w-24 h-5 rounded-full" />
                <Skeleton className="w-3/4 h-7" />
                <Skeleton className="w-full h-12" />
              </div>
              <div className="space-y-3">
                <Skeleton className="w-32 h-7" />
                <div className="flex gap-3">
                  <Skeleton className="flex-1 h-10 rounded-lg" />
                  <Skeleton className="flex-1 h-10 rounded-lg" />
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
      <section className="w-full py-12 px-4 bg-slate-900 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-3.5">
          <Badge variant="blue" size="sm">
            Direct Warehouse Value
          </Badge>
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
    <section className="relative w-full py-5 md:py-8 bg-slate-100/70 border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative">
        {/* Top Tagline Strip */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight">Daily Problem-Solvers</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 hidden sm:inline">Practical items for smart living</span>
          </div>
          <Link to="/products" className="text-primary hover:underline font-bold text-xs inline-flex items-center gap-1">
            <span>Explore Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Hero Spotlight Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row relative">
          
          {/* Media / Image */}
          <div className="w-full md:w-5/12 aspect-[4/3] md:aspect-auto md:min-h-[320px] bg-slate-50 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
            <img
              src={mainImage}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="green" size="sm">
                  {discountPercent}% OFF
                </Badge>
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
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Badge variant="blue" size="sm">
                  <Sparkles className="w-3 h-3 text-primary inline mr-1" />
                  {currentProduct.optionsLabel || 'Trending Everyday Essential'}
                </Badge>
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

            <div className="pt-4 border-t border-slate-100 mt-4 space-y-3.5">
              {/* Pricing */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  ₹{Number(currentProduct.price).toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
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
                  className="w-full sm:flex-1 justify-center"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  {currentProduct.hasVariants ? 'Choose Options' : 'Add to Cart'}
                </Button>
                <Link to={`/product/${currentProduct.slug}`} className="w-full sm:flex-1">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Product
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slide Switcher */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <div className="flex gap-1.5 items-center">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-150 ${
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
                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-slate-300 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next spotlight"
                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-slate-300 transition-colors"
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
