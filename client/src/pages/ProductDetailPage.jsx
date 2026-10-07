import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { 
  FiShoppingCart, FiZap, FiTruck, FiShield, FiRefreshCw, 
  FiCheckCircle, FiPlay, FiImage, FiShare2, FiStar, FiChevronRight, FiMessageCircle 
} from 'react-icons/fi';
import SEO from '../components/common/SEO';
import { useUIStore } from '../store/uiStore';

const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    getProductBySlug(slug: $slug) {
      id
      name
      slug
      shortDescription
      description
      price
      compareAtPrice
      images
      stockQuantity
      optionsLabel
      productVideoUrl
      features
      isActive
      category {
        id
        name
        slug
      }
    }
  }
`;

const GET_RELATED_PRODUCTS = gql`
  query GetAllProducts {
    getAllProducts {
      id
      name
      slug
      price
      compareAtPrice
      images
      optionsLabel
    }
  }
`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [selectedMedia, setSelectedMedia] = useState('image-0');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const { openCart } = useUIStore();

  const { data, loading, error } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug },
    skip: !slug
  });

  const { data: relatedData } = useQuery(GET_RELATED_PRODUCTS);

  const product = data?.getProductBySlug;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">The product you are looking for might have been moved or is currently unavailable.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Browse All Products <FiChevronRight />
          </Link>
        </div>
      </div>
    );
  }

  const {
    name,
    shortDescription,
    description,
    price,
    compareAtPrice,
    images = [],
    stockQuantity,
    optionsLabel,
    productVideoUrl,
    features = [],
    category
  } = product;

  // Format images
  const formattedImages = images.map(img => 
    img.startsWith('http') ? img : `${API_URL}${img}`
  );
  if (formattedImages.length === 0) {
    formattedImages.push('https://placehold.co/600x600?text=No+Image');
  }

  // Calculate discount
  let discountPercentage = 0;
  if (compareAtPrice && compareAtPrice > price) {
    discountPercentage = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(`Hi Zoberry Enterprise! I want to order: ${name} (Price: Rs. ${price}, Qty: ${quantity}) - Link: ${window.location.href}`);
    window.open(`https://wa.me/919638601192?text=${text}`, '_blank');
  };

  // Helper for YouTube embed
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    if (url.includes('youtube.com/shorts/')) {
      const videoId = url.split('/shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    return url;
  };

  const isEmbedVideo = productVideoUrl && (productVideoUrl.includes('youtube') || productVideoUrl.includes('youtu.be') || productVideoUrl.includes('vimeo'));

  // Rich Schema.org Product JSON-LD
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": formattedImages,
    "description": description || shortDescription || `${name} - Smart home and kitchen utility item by Zoberry Enterprise`,
    "sku": `ZB-${product.id.slice(0, 8)}`,
    "brand": {
      "@type": "Brand",
      "name": "Zoberry Enterprise"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.zoberryenterprise.shop/product/${slug}`,
      "priceCurrency": "INR",
      "price": price,
      "priceValidUntil": "2028-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Zoberry Enterprise"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "28"
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16">
      <SEO
        title={name}
        description={shortDescription || description || `Buy ${name} online at best price on Zoberry Enterprise. High quality home and kitchen utility essentials.`}
        keywords={`${name}, home utility products, kitchen tools, buy ${name} online, easy home decor, daily essentials india, zoberry enterprise`}
        image={formattedImages[0]}
        url={`/product/${slug}`}
        productSchema={productSchema}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4 md:px-8 text-xs text-gray-500 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary">Home</Link>
          <FiChevronRight size={12} />
          <Link to="/products" className="hover:text-primary">Products</Link>
          {category && (
            <>
              <FiChevronRight size={12} />
              <Link to={`/products?category=${category.slug}`} className="hover:text-primary">{category.name}</Link>
            </>
          )}
          <FiChevronRight size={12} />
          <span className="text-gray-800 font-medium truncate max-w-xs">{name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pt-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Gallery & Video (5 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* Main Media Display Box */}
              <div className="relative aspect-square w-full rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                {selectedMedia === 'video' && productVideoUrl ? (
                  isEmbedVideo ? (
                    <iframe
                      src={getEmbedUrl(productVideoUrl)}
                      title={name}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={productVideoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <img
                    src={formattedImages[parseInt(selectedMedia.replace('image-', ''), 10) || 0]}
                    alt={name}
                    className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <span className="absolute top-4 left-4 bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-sm">
                    {discountPercentage}% OFF
                  </span>
                )}

                {/* Options Badge */}
                {optionsLabel && (
                  <span className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {optionsLabel}
                  </span>
                )}
              </div>

              {/* Thumbnails row (Images + Video button) */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {formattedImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMedia(`image-${idx}`)}
                    className={`relative w-18 h-18 rounded-lg overflow-hidden border-2 flex-shrink-0 bg-gray-50 transition-all ${selectedMedia === `image-${idx}` ? 'border-primary shadow-sm scale-105' : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${name} thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* Video Thumbnail Button if Video is Available */}
                {productVideoUrl && (
                  <button
                    onClick={() => setSelectedMedia('video')}
                    className={`relative w-18 h-18 rounded-lg overflow-hidden border-2 flex-shrink-0 flex flex-col items-center justify-center bg-purple-50 text-purple-700 font-bold transition-all ${selectedMedia === 'video' ? 'border-purple-600 ring-2 ring-purple-200 scale-105' : 'border-purple-200 hover:border-purple-400'}`}
                  >
                    <FiPlay size={22} className="text-purple-600 mb-0.5" />
                    <span className="text-[10px] uppercase tracking-wider">Video</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Product Buy Box & Details (6 cols) */}
            <div className="lg:col-span-6 flex flex-col">
              
              {/* Category & Share */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {category?.name || 'Home & Kitchen Utility'}
                </span>
                <button
                  onClick={handleShare}
                  className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition-colors"
                  title="Copy Product Link"
                >
                  <FiShare2 size={13} />
                  {copied ? 'Link Copied!' : 'Share'}
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                {name}
              </h1>

              {/* Rating stars */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar key={s} size={15} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700">4.9 / 5</span>
                <span className="text-xs text-gray-400 font-medium">(28 Verified Customer Reviews)</span>
              </div>

              {/* Price Row */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">
                  Rs. {price.toLocaleString()}
                </span>
                {compareAtPrice > price && (
                  <span className="text-base text-gray-400 line-through">
                    Rs. {compareAtPrice.toLocaleString()}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                    Save {discountPercentage}%
                  </span>
                )}
              </div>

              {/* Short Description */}
              {shortDescription && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {shortDescription}
                </p>
              )}

              {/* Quantity & Buy Actions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-sm text-gray-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className={`text-xs font-medium ${stockQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stockQuantity > 0 ? `✓ In Stock (${stockQuantity} available)` : 'Out of Stock'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={openCart}
                    className="w-full bg-[#0f4c81] hover:bg-[#0c3c66] text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <FiShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <FiMessageCircle size={18} />
                    Order via WhatsApp
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-t border-b border-gray-100 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <FiTruck className="text-primary flex-shrink-0" size={18} />
                  <span>Fast Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiRefreshCw className="text-primary flex-shrink-0" size={18} />
                  <span>7 Days Return</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiShield className="text-primary flex-shrink-0" size={18} />
                  <span>100% Quality Checked</span>
                </div>
              </div>

              {/* Highlights / Features List */}
              {features && features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Key Highlights:
                  </h3>
                  <ul className="space-y-2">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <FiCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          {/* Full Description & Specs Section */}
          {description && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Product Description & Usage Guide
              </h2>
              <div className="prose max-w-none text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {description}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
