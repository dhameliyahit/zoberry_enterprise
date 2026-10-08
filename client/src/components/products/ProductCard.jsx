import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiCheck } from 'react-icons/fi';
import Modal from '../common/Modal';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const ProductCard = ({ product }) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addToCart, loading: cartLoading } = useCart();
  const { isSaved, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const { id, name, slug, price, compareAtPrice, images, optionsLabel, stockQuantity, hasVariants, variants } = product;

  const rawImage = images && images.length > 0 ? images[0] : null;
  const mainImage = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `${API_URL}${rawImage}`)
    : 'https://placehold.co/400x500?text=No+Image';

  // Calculate discount percentage
  let discount = 0;
  if (compareAtPrice && compareAtPrice > price) {
    discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  }

  const isOutOfStock = stockQuantity !== null && stockQuantity !== undefined && stockQuantity <= 0;
  const inWishlist = isSaved(id);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, navigate to detail page to pick variant accurately
    if (hasVariants && variants && variants.length > 0) {
      navigate(`/product/${slug}`);
      return;
    }

    if (isOutOfStock) return;

    try {
      await addToCart(id, null, 1);
    } catch (err) {
      // Toast handled by useCart
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <>
      <div className="group flex flex-col bg-white rounded border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 overflow-hidden relative">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {discount > 0 && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
              {discount}% OFF
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
              Sold Out
            </div>
          )}
        </div>

        {/* Right Side Action Buttons (Wishlist & Quick View) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all transform sm:translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleWishlistClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
              inWishlist
                ? 'bg-red-50 text-red-500 border border-red-200'
                : 'bg-white text-gray-400 hover:text-red-500 hover:shadow-md'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <FiHeart size={15} className={inWishlist ? 'fill-current' : ''} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-md transition-all shadow-sm"
            title="Quick View"
          >
            <FiEye size={15} />
          </button>
        </div>

        {/* Image Container */}
        <Link to={`/product/${slug}`} className="block relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
          <img
            src={mainImage}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 hidden sm:block">
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock || cartLoading}
              className={`w-full font-bold py-2.5 rounded-sm shadow-sm flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-wide ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white/95 backdrop-blur-sm hover:bg-primary text-secondary hover:text-white border border-gray-200 hover:border-primary'
              }`}
            >
              <FiShoppingCart size={14} />
              {hasVariants ? 'Select Option' : isOutOfStock ? 'Sold Out' : 'Quick Add'}
            </button>
          </div>
        </Link>

        {/* Content Container */}
        <div className="p-3.5 md:p-4 flex flex-col flex-grow">
          {/* Options / Category Label */}
          <span className="text-[10px] md:text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
            {optionsLabel || (hasVariants ? 'Multiple Options' : 'Utility Item')}
          </span>

          {/* Product Name */}
          <Link
            to={`/product/${slug}`}
            className="text-secondary font-bold text-xs md:text-sm leading-snug mb-2 hover:text-primary transition-colors line-clamp-2"
          >
            {name}
          </Link>

          {/* Pricing */}
          <div className="mt-auto flex items-baseline gap-2 pt-2 border-t border-gray-50">
            <span className="text-sm md:text-base font-extrabold text-secondary">
              Rs. {price.toLocaleString()}
            </span>
            {compareAtPrice > price && (
              <span className="text-xs text-gray-400 line-through">
                Rs. {compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)}>
        <div className="flex flex-col md:flex-row h-full max-w-2xl bg-white rounded overflow-hidden">
          {/* Left: Image */}
          <div className="w-full md:w-1/2 bg-gray-50 relative min-h-[250px] md:min-h-[350px]">
            <img src={mainImage} alt={name} className="absolute inset-0 w-full h-full object-cover" />
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-sm mb-3">
                {optionsLabel || 'Utility'}
              </span>

              <h2 className="text-xl md:text-2xl font-bold text-secondary mb-3 leading-tight">
                {name}
              </h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-extrabold text-secondary">
                  Rs. {price.toLocaleString()}
                </span>
                {compareAtPrice > price && (
                  <span className="text-sm text-gray-400 line-through">
                    Rs. {compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6">
                Premium quality item designed for daily convenience and smart utility.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  handleQuickAdd(e);
                  setIsQuickViewOpen(false);
                }}
                disabled={isOutOfStock}
                className="w-full btn-primary py-3 text-xs"
              >
                <FiShoppingCart size={15} />
                {hasVariants ? 'View Options' : isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>
              <Link
                to={`/product/${slug}`}
                onClick={() => setIsQuickViewOpen(false)}
                className="block w-full text-center text-xs font-bold text-gray-500 hover:text-primary transition-colors underline underline-offset-4"
              >
                View Full Product Details
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
