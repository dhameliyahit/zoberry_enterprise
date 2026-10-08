import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiEye } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { getImageUrl } from '../../utils/imageUrl';

export function ProductCard({ product }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addToCart, loading: cartLoading } = useCart();
  const { isSaved, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const {
    id,
    name,
    slug,
    price = 0,
    compareAtPrice,
    images = [],
    optionsLabel,
    stockQuantity,
    hasVariants,
    variants = [],
    shortDescription,
  } = product;

  const mainImage = images && images.length > 0 ? getImageUrl(images[0]) : getImageUrl(null);

  // Calculate discount
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const isOutOfStock = stockQuantity !== null && stockQuantity !== undefined && stockQuantity <= 0;
  const inWishlist = isSaved(id);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants && variants && variants.length > 0) {
      navigate(`/product/${slug}`);
      return;
    }

    if (isOutOfStock) return;

    try {
      await addToCart(id, null, 1);
    } catch {
      // Handled by store/toast
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <>
      <div className="group relative flex flex-col bg-white border border-slate-200 rounded-[2px] overflow-hidden hover:border-slate-400 hover:shadow-sm transition-all duration-150">
        {/* Top Badges (Warehouse Crisp Rectangular Badges) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
          {hasDiscount && (
            <span className="px-1.5 py-0.5 bg-[#dc2626] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-[2px]">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="px-1.5 py-0.5 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-[2px]">
              Sold Out
            </span>
          )}
        </div>

        {/* Top-Right Quick Actions */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-150">
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`w-7 h-7 rounded-[2px] flex items-center justify-center transition-colors shadow-2xs border ${
              inWishlist
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white text-slate-500 hover:text-red-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {inWishlist ? <FaHeart className="w-3.5 h-3.5 text-red-600" /> : <FiHeart className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            aria-label="Quick preview"
            className="w-7 h-7 rounded-[2px] bg-white text-slate-500 hover:text-primary border border-slate-200 hover:bg-slate-50 shadow-2xs flex items-center justify-center transition-colors"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Image Link */}
        <Link
          to={`/product/${slug}`}
          className="relative block w-full aspect-square bg-[#f8fafc] overflow-hidden border-b border-slate-100"
        >
          <img
            src={mainImage}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-200"
          />
        </Link>

        {/* Product Card Details */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 gap-1.5 justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              {optionsLabel || (hasVariants ? 'Options Available' : 'Daily Utility')}
            </span>

            <Link
              to={`/product/${slug}`}
              className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 hover:text-primary transition-colors leading-snug"
            >
              {name}
            </Link>
          </div>

          <div className="pt-2">
            {/* Pricing Block */}
            <div className="flex items-baseline gap-2 mb-2.5">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                ₹{Number(price).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{Number(compareAtPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Warehouse Theme Quick Add Button */}
            <Button
              onClick={handleQuickAdd}
              disabled={isOutOfStock || cartLoading}
              variant={isOutOfStock ? 'secondary' : 'primary'}
              size="sm"
              className="w-full text-xs font-bold uppercase tracking-wider h-8"
              leftIcon={<FiShoppingBag className="w-3.5 h-3.5" />}
            >
              {hasVariants ? 'Choose Options' : isOutOfStock ? 'Sold Out' : 'Quick Add'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square bg-slate-50 rounded-[2px] overflow-hidden border border-slate-200">
            <img src={mainImage} alt={name} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 text-[10px] font-bold uppercase rounded-[2px] inline-block mb-2">
                {optionsLabel || 'Smart Utility'}
              </span>

              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{name}</h2>

              <div className="flex items-baseline gap-2.5 mb-4">
                <span className="text-xl font-extrabold text-slate-900">
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{Number(compareAtPrice).toLocaleString('en-IN')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-[2px]">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                {shortDescription ||
                  'Engineered for maximum daily utility, durability, and practical problem-solving in modern homes.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <Button
                onClick={(e) => {
                  handleQuickAdd(e);
                  setIsQuickViewOpen(false);
                }}
                disabled={isOutOfStock}
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<FiShoppingBag className="w-4 h-4" />}
              >
                {hasVariants ? 'View Options' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </Button>

              <Link
                to={`/product/${slug}`}
                onClick={() => setIsQuickViewOpen(false)}
                className="block text-center text-xs font-bold text-primary hover:underline uppercase tracking-wide"
              >
                Full Product Specifications & Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ProductCard;
