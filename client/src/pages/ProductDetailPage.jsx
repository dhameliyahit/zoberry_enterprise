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
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">
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
    <div className="bg-slate-50 min-h-screen py-6 sm:py-10">
      <SEO
        title={`${name} | Zoberry Enterprise`}
        description={shortDescription || `${name} - Shop online at Zoberry Enterprise.`}
        image={formattedImages[0]}
        url={`/product/${slug}`}
      />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs text-slate-500 mb-6 gap-1.5 overflow-x-auto whitespace-nowrap">
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
          <span className="text-slate-800 font-semibold truncate max-w-xs">{name}</span>
        </nav>

        {/* Main Product Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {/* Left Column: Media Gallery (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Stage */}
            <div className="relative w-full aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
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
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="success" size="md">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
              {productVideoUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedMedia('video')}
                  aria-label="View product video"
                  className={`w-16 h-16 rounded-lg border flex flex-col items-center justify-center gap-1 shrink-0 bg-slate-900 text-white text-[10px] font-bold transition-all ${
                    selectedMedia === 'video'
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  <Play className="w-4 h-4" /> Video
                </button>
              )}
              {formattedImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedMedia(`image-${idx}`)}
                  aria-label={`View image ${idx + 1}`}
                  className={`w-16 h-16 rounded-lg border overflow-hidden shrink-0 bg-slate-50 transition-all ${
                    selectedMedia === `image-${idx}`
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-slate-200 hover:border-slate-300'
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
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {category?.name || 'Smart Living Utility'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-md transition-colors"
                  title="Share product link"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-2 rounded-md transition-colors ${
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 leading-tight">
              {name}
            </h1>

            {/* SKU & Stock Availability */}
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                </span>
              )}
            </div>

            {/* Pricing Block */}
            <div className="flex items-baseline gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                ₹{Number(currentPrice).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ₹{Number(currentComparePrice).toLocaleString('en-IN')}
                  </span>
                  <Badge variant="success" size="md">
                    Save ₹{Number(currentComparePrice - currentPrice).toLocaleString('en-IN')}
                  </Badge>
                </>
              )}
            </div>

            {/* Variant Selector (if available) */}
            {hasVariants && variants && variants.length > 0 && (
              <div className="mb-6 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {optionsLabel || 'Select Option'}:{' '}
                  <span className="text-primary font-semibold">{selectedVariant?.title}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isVariantOut = v.stockQuantity <= 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        disabled={isVariantOut}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-xs'
                            : isVariantOut
                            ? 'border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {v.title}
                        {v.price !== basePrice && (
                          <span className="ml-1 text-[11px] opacity-90">
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
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || cartLoading}
                  variant="outline"
                  size="lg"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || cartLoading}
                  variant="primary"
                  size="lg"
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  Buy It Now
                </Button>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50/75 rounded-xl border border-slate-200 text-center text-xs text-slate-600 mb-6">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-primary" />
                <span className="font-semibold text-[11px] text-slate-800">Fast Dispatch</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-semibold text-[11px] text-slate-800">PhonePe Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <PackageCheck className="w-4 h-4 text-primary" />
                <span className="font-semibold text-[11px] text-slate-800">Quality Checked</span>
              </div>
            </div>

            {/* Key Features / Highlights */}
            {features && features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5">
                  Product Highlights
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Description */}
            {description && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5">
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
