import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  FiShoppingCart, FiZap, FiTruck, FiShield, FiRefreshCw,
  FiCheckCircle, FiPlay, FiImage, FiShare2, FiHeart, FiChevronRight,
  FiAlertCircle, FiMinus, FiPlus,
} from 'react-icons/fi';
import SEO from '../components/common/SEO';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useUIStore } from '../store/uiStore';
import { GET_PRODUCT_BY_SLUG } from '../graphql/products';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedMedia, setSelectedMedia] = useState('image-0');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  
  const { addToCart, loading: cartLoading } = useCart();
  const { isSaved, toggleWishlist } = useWishlist();
  const { openCart, addToast } = useUIStore();

  const { data, loading, error } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const product = data?.getProductBySlug;

  // Auto-select first active variant if product has variants
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const firstActive = product.variants.find((v) => v.isActive !== false) || product.variants[0];
      setSelectedVariant(firstActive);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  // Set default media
  useEffect(() => {
    if (product?.productVideoUrl) {
      setSelectedMedia('video');
    } else {
      setSelectedMedia('image-0');
    }
  }, [product?.productVideoUrl]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">
            The product you are looking for might have been moved or is currently unavailable.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Browse All Products <FiChevronRight />
          </Link>
        </div>
      </div>
    );
  }

  const {
    id,
    name,
    shortDescription,
    description,
    price: basePrice,
    compareAtPrice: baseComparePrice,
    images = [],
    stockQuantity: baseStock,
    hasVariants,
    variants = [],
    productVideoUrl,
    features = [],
    category,
    optionsLabel,
  } = product;

  // Dynamic pricing and stock based on variant selection
  const currentPrice = selectedVariant ? selectedVariant.price : basePrice;
  const currentComparePrice = selectedVariant?.compareAtPrice || baseComparePrice;
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : baseStock;
  const currentSku = selectedVariant?.sku || `ZB-${id.substring(0, 6).toUpperCase()}`;

  const isOutOfStock = currentStock !== null && currentStock !== undefined && currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  const formattedImages = images.map((img) =>
    img.startsWith('http') ? img : `${API_URL}${img}`
  );
  if (formattedImages.length === 0) {
    formattedImages.push('https://placehold.co/600x600?text=No+Image');
  }

  let discountPercentage = 0;
  if (currentComparePrice && currentComparePrice > currentPrice) {
    discountPercentage = Math.round(
      ((currentComparePrice - currentPrice) / currentComparePrice) * 100
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Product link copied to clipboard!', 'info');
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      await addToCart(id, selectedVariant ? selectedVariant.id : null, quantity);
      openCart();
    } catch (err) {
      // Toast already handled by useCart
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      await addToCart(id, selectedVariant ? selectedVariant.id : null, quantity);
      navigate('/checkout');
    } catch (err) {
      // Toast handled
    }
  };

  const inWishlist = isSaved(id);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-6 md:py-10">
      <SEO
        title={`${name} | Zoberry Enterprise`}
        description={shortDescription || `${name} - Shop online at Zoberry Enterprise.`}
        image={formattedImages[0]}
        url={`/product/${slug}`}
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs text-gray-500 mb-6 gap-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <FiChevronRight size={12} className="text-gray-400" />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          {category && (
            <>
              <FiChevronRight size={12} className="text-gray-400" />
              <Link to={`/products?category=${category.slug}`} className="hover:text-primary transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <FiChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-800 font-semibold truncate max-w-xs">{name}</span>
        </nav>

        {/* Product Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 bg-white p-5 md:p-8 rounded-lg border border-gray-200 shadow-xs">
          
          {/* Left Column: Media Gallery (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Stage */}
            <div className="relative w-full aspect-square bg-gray-50 rounded border border-gray-100 overflow-hidden flex items-center justify-center">
              {selectedMedia === 'video' && productVideoUrl ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <iframe
                    src={productVideoUrl.includes('embed') ? productVideoUrl : productVideoUrl}
                    title={name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={
                    formattedImages[
                      parseInt(selectedMedia.replace('image-', ''), 10) || 0
                    ]
                  }
                  alt={name}
                  className="w-full h-full object-contain p-2"
                />
              )}

              {/* Discount Tag */}
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {productVideoUrl && (
                <button
                  onClick={() => setSelectedMedia('video')}
                  className={`w-16 h-16 rounded border flex flex-col items-center justify-center gap-1 shrink-0 bg-gray-900 text-white text-[10px] font-bold transition-all ${
                    selectedMedia === 'video'
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-gray-200 opacity-80'
                  }`}
                >
                  <FiPlay size={16} /> Video
                </button>
              )}
              {formattedImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMedia(`image-${idx}`)}
                  className={`w-16 h-16 rounded border overflow-hidden shrink-0 bg-gray-50 transition-all ${
                    selectedMedia === `image-${idx}`
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Actions (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Category / Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {category?.name || 'General Utility'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="text-gray-400 hover:text-gray-700 p-1.5 rounded transition-colors"
                  title="Share product"
                >
                  <FiShare2 size={16} />
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-1.5 rounded transition-colors ${
                    inWishlist ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                  }`}
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <FiHeart size={16} className={inWishlist ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-secondary tracking-tight mb-2 leading-tight">
              {name}
            </h1>

            {/* SKU & Stock Availability */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
              <span>SKU: <span className="font-semibold text-gray-700">{currentSku}</span></span>
              <span>•</span>
              {isOutOfStock ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <FiAlertCircle size={13} /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-bold">
                  Only {currentStock} left in stock!
                </span>
              ) : (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <FiCheckCircle size={13} /> In Stock
                </span>
              )}
            </div>

            {/* Pricing Area */}
            <div className="flex items-baseline gap-3 mb-6 bg-gray-50/70 p-4 rounded border border-gray-100">
              <span className="text-2xl md:text-3xl font-extrabold text-secondary">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {currentComparePrice > currentPrice && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    Rs. {currentComparePrice.toLocaleString()}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded uppercase">
                    Save Rs. {(currentComparePrice - currentPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Variant Selector (if available) */}
            {hasVariants && variants && variants.length > 0 && (
              <div className="mb-6 space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  {optionsLabel || 'Select Option'}: <span className="text-primary font-normal">{selectedVariant?.title}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isVariantOut = v.stockQuantity <= 0;

                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={isVariantOut}
                        className={`px-3.5 py-2 rounded text-xs font-bold border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-xs'
                            : isVariantOut
                            ? 'border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {v.title}
                        {v.price !== basePrice && (
                          <span className="ml-1 text-[10px] font-normal opacity-90">
                            (Rs. {v.price})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Picker & Actions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quantity:</label>
                <div className="flex items-center border border-gray-200 rounded bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-40"
                  >
                    <FiMinus size={13} />
                  </button>
                  <span className="px-4 text-xs font-bold text-gray-800 min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock || (currentStock && quantity >= currentStock)}
                    className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-40"
                  >
                    <FiPlus size={13} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || cartLoading}
                  className="btn-outline py-3.5 text-xs tracking-wider"
                >
                  <FiShoppingCart size={15} />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || cartLoading}
                  className="btn-primary py-3.5 text-xs tracking-wider bg-primary hover:bg-primary-hover"
                >
                  <FiZap size={15} />
                  Buy It Now
                </button>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded border border-gray-100 text-center text-xs text-gray-600 mb-6">
              <div className="flex flex-col items-center gap-1">
                <FiTruck className="text-primary" size={18} />
                <span className="font-semibold text-[11px]">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FiShield className="text-primary" size={18} />
                <span className="font-semibold text-[11px]">Secure Order</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FiRefreshCw className="text-primary" size={18} />
                <span className="font-semibold text-[11px]">Easy Replacement</span>
              </div>
            </div>

            {/* Product Features List */}
            {features && features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Key Highlights</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  {features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={14} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Description */}
            {description && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Product Description</h3>
                <div
                  className="text-xs md:text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
