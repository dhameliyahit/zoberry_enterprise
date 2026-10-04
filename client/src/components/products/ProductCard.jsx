import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiCheck } from 'react-icons/fi';
import Modal from '../common/Modal';

const ProductCard = ({ product }) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { name, slug, price, compareAtPrice, images, optionsLabel } = product;
  const mainImage = images && images.length > 0 ? images[0] : 'https://placehold.co/400x500?text=No+Image';
  
  // Calculate discount percentage
  let discount = 0;
  if (compareAtPrice && compareAtPrice > price) {
    discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  }

  return (
    <>
      <div className="group flex flex-col bg-white rounded border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 overflow-hidden relative">
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-green-50 text-green-600 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
            {discount}% OFF
          </div>
        )}

        {/* Right Side Hover Buttons (Wishlist & Quick View) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:shadow-md transition-all shadow-sm" title="Add to Wishlist">
            <FiHeart size={16} />
          </button>
          
          <button 
            onClick={() => setIsQuickViewOpen(true)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-md transition-all shadow-sm" 
            title="Quick View"
          >
            <FiEye size={16} />
          </button>
        </div>

        {/* Image Container */}
        <Link to={`/product/${slug}`} className="block relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
          <img 
            src={mainImage} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Quick Add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
             <button 
               onClick={(e) => { e.preventDefault(); /* Add to cart logic */ }}
               className="w-full bg-white/95 backdrop-blur-sm hover:bg-primary text-secondary hover:text-white font-bold py-2.5 rounded-sm shadow-sm flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-wide border border-gray-200 hover:border-primary"
             >
               <FiShoppingCart size={14} /> Quick Add
             </button>
          </div>
        </Link>

        {/* Content Container */}
        <div className="p-4 md:p-5 flex flex-col flex-grow">
          
          {/* Options / Category Label */}
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1.5 block">
            {optionsLabel || 'Trending'}
          </span>

          {/* Product Name */}
          <Link to={`/product/${slug}`} className="text-secondary font-bold text-sm md:text-base leading-snug mb-2 hover:text-primary transition-colors line-clamp-2">
            {name}
          </Link>

          {/* Pricing */}
          <div className="mt-auto flex items-end gap-2 pt-2">
            <span className="text-lg md:text-xl font-extrabold text-secondary leading-none">Rs. {price.toLocaleString()}</span>
            {compareAtPrice > price && (
              <span className="text-xs md:text-sm text-gray-400 line-through mb-0.5">Rs. {compareAtPrice.toLocaleString()}</span>
            )}
          </div>
        </div>

      </div>

      {/* Quick View Modal */}
      <Modal isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)}>
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Image */}
          <div className="w-full md:w-1/2 bg-gray-50 relative min-h-[300px]">
             <img src={mainImage} alt={name} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          
          {/* Right: Details */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-white">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-sm w-max mb-4">
              {optionsLabel || 'Trending Product'}
            </span>
            
            <h2 className="text-2xl md:text-3xl font-extrabold text-secondary mb-4 leading-tight uppercase tracking-tight">
              {name}
            </h2>
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-extrabold text-secondary leading-none">Rs. {price.toLocaleString()}</span>
              {compareAtPrice > price && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-0.5">Rs. {compareAtPrice.toLocaleString()}</span>
                  <span className="bg-green-50 text-green-600 border border-green-200 text-xs font-bold px-2 py-1 rounded-sm mb-1 uppercase">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-8 border-b border-gray-100 pb-8">
              Experience premium quality and exceptional design with this featured product. It's built to elevate your everyday lifestyle with perfect functionality.
            </p>

            <ul className="space-y-3 mb-8">
               <li className="flex items-center gap-3 text-sm text-gray-600"><FiCheck className="text-green-500" /> In stock and ready to ship</li>
               <li className="flex items-center gap-3 text-sm text-gray-600"><FiCheck className="text-green-500" /> Free Express Delivery over Rs. 1500</li>
            </ul>
            
            <div className="mt-auto">
               <button className="w-full btn-primary py-4 text-sm">
                 <FiShoppingCart size={18} /> Add to Cart
               </button>
               <Link to={`/product/${slug}`} className="block w-full text-center mt-4 text-sm font-bold text-gray-500 hover:text-primary transition-colors underline underline-offset-4">
                 View Full Details
               </Link>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
