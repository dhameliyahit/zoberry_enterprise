import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Play,
  Share2,
  Heart,
  ChevronRight,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useUIStore } from '../store/uiStore';
import { GET_PRODUCT_BY_SLUG } from '../graphql/products';
import { getImageUrl } from '../utils/imageUrl';

export function ProductDetailPage() {
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
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium text-xs">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-[2px] border border-slate-200 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-500 text-xs mb-6">
            The product you are looking for might have been moved or is currently unavailable.
          </p>
          <Link to="/products">
            <Button variant="primary" size="md">
              Browse All Products
            </Button>
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
    price: basePrice = 0,
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

  const formattedImages = images.map((img) => getImageUrl(img));
  if (formattedImages.length === 0) {
    formattedImages.push(getImageUrl(null));
  }

  const hasDiscount = currentComparePrice && currentComparePrice > currentPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

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
    } catch {
      // Handled in store
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      await addToCart(id, selectedVariant ? selectedVariant.id : null, quantity);
      navigate('/checkout');
    } catch {
      // Handled
    }
  };

  const inWishlist = isSaved(id);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-5 sm:py-8">
      <SEO
        title={`${name} | Zoberry Enterprise`}
        description={shortDescription || `${name} - Shop online at Zoberry Enterprise.`}
        image={formattedImages[0]}
        url={`/product/${slug}`}
      />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs text-slate-500 mb-4 gap-1.5 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link to="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <Link
                to={`/category/${category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{name}</span>
        </nav>

        {/* Main Product Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white p-4 sm:p-7 rounded-[2px] border border-slate-200 shadow-2xs">
          {/* Left Column: Media Gallery (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            {/* Main Stage */}
            <div className="relative w-full aspect-square bg-[#f8fafc] rounded-[2px] border border-slate-200 overflow-hidden flex items-center justify-center">
              {selectedMedia === 'video' && productVideoUrl ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <iframe
                    src={productVideoUrl}
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
                  className="w-full h-full object-cover object-center"
                />
              )}

              {/* Discount Tag */}
              {discountPercentage > 0 && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-1 bg-[#dc2626] text-white text-xs font-black uppercase tracking-wider rounded-[2px] shadow-xs">
                    SAVE {discountPercentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {productVideoUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedMedia('video')}
                  aria-label="View product video"
                  className={`w-14 h-14 rounded-[2px] border flex flex-col items-center justify-center gap-1 shrink-0 bg-slate-900 text-white text-[9px] font-bold transition-all ${
                    selectedMedia === 'video'
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" /> Video
                </button>
              )}
              {formattedImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedMedia(`image-${idx}`)}
                  aria-label={`View image ${idx + 1}`}
                  className={`w-14 h-14 rounded-[2px] border overflow-hidden shrink-0 bg-[#f8fafc] transition-all ${
                    selectedMedia === `image-${idx}`
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Actions (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Category / Actions Header */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                {category?.name || 'Smart Living Utility'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-[2px] transition-colors"
                  title="Share product link"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-1.5 rounded-[2px] transition-colors ${
                    inWishlist ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-red-600'
                  }`}
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight mb-2 leading-snug">
              {name}
            </h1>

            {/* SKU & Stock Availability */}
            <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-3.5 pb-3 border-b border-slate-200">
              <span>
                SKU: <span className="font-semibold text-slate-800">{currentSku}</span>
              </span>
              <span>•</span>
              {isOutOfStock ? (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-semibold">
                  Only {currentStock} left in stock!
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Ready to Ship
                </span>
              )}
            </div>

            {/* Pricing Block */}
            <div className="flex items-baseline gap-3 mb-5 bg-[#f8fafc] p-3.5 rounded-[2px] border border-slate-200">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                ₹{Number(currentPrice).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    ₹{Number(currentComparePrice).toLocaleString('en-IN')}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-bold uppercase rounded-[2px]">
                    Save ₹{Number(currentComparePrice - currentPrice).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Variant Selector (if available) */}
            {hasVariants && variants && variants.length > 0 && (
              <div className="mb-5 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {optionsLabel || 'Select Option'}:{' '}
                  <span className="text-primary font-semibold">{selectedVariant?.title}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isVariantOut = v.stockQuantity <= 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        disabled={isVariantOut}
                        className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase tracking-wider border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-2xs'
                            : isVariantOut
                            ? 'border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {v.title}
                        {v.price !== basePrice && (
                          <span className="ml-1 text-[10px] opacity-90">
                            (₹{Number(v.price).toLocaleString('en-IN')})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Purchase Action Buttons */}
            <div className="space-y-3.5 mb-6">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Quantity:
                </label>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={currentStock || 99}
                  disabled={isOutOfStock}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || cartLoading}
                  variant="outline"
                  size="md"
                  className="h-11 font-bold uppercase tracking-wider"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || cartLoading}
                  variant="primary"
                  size="md"
                  className="h-11 font-bold uppercase tracking-wider"
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  Buy It Now
                </Button>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#f8fafc] rounded-[2px] border border-slate-200 text-center text-xs text-slate-600 mb-5">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-primary" />
                <span className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">Fast Dispatch</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">PhonePe Secured</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <PackageCheck className="w-4 h-4 text-primary" />
                <span className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">Quality Checked</span>
              </div>
            </div>

            {/* Key Features / Highlights */}
            {features && features.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Product Highlights
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Description */}
            {description && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Product Description
                </h3>
                <div
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
