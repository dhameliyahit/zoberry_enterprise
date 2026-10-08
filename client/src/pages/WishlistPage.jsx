import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useUIStore } from '../store/uiStore';
import SEO from '../components/common/SEO';
import { Button, Card, CardBody, Badge, EmptyState } from '../components/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();
  const { user, openAuthModal, openCart } = useUIStore();

  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product.id, null, 1);
      await removeFromWishlist(product.id);
      openCart();
    } catch (err) {
      // Toast handled
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center px-4">
        <SEO title="My Wishlist | Zoberry Enterprise" url="/wishlist" />
        <Card className="p-8 text-center max-w-md w-full shadow-xs">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="w-8 h-8 fill-red-100" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Save Your Favorite Items</h2>
          <p className="text-slate-500 text-xs md:text-sm mb-6">
            Sign in to your Zoberry account to view and manage your saved wishlist items across all your devices.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => openAuthModal('login')}
          >
            Sign In / Register
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <SEO
        title="My Wishlist | Zoberry Enterprise"
        description="View and manage your saved favorite products."
        url="/wishlist"
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="pb-6 border-b border-slate-200 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              {wishlist.length > 0 ? `${wishlist.length} item(s) saved` : 'Your wishlist is empty'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-medium">Loading your wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto shadow-xs">
            <EmptyState
              icon={FiHeart}
              title="No items saved yet"
              description="Browse our catalog and click the heart icon on items you want to save for later."
              actionLabel="Explore Catalog"
              onAction={() => window.location.href = '/products'}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((product) => {
              const rawImg = product.images?.[0];
              const imageUrl = rawImg
                ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`)
                : 'https://placehold.co/300x300?text=No+Image';

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all group"
                >
                  <div className="relative">
                    <Link to={`/product/${product.slug}`} className="block aspect-[4/5] bg-slate-50 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 text-slate-400 hover:text-red-500 flex items-center justify-center shadow-sm transition-colors"
                      title="Remove from wishlist"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <CardBody className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        {product.category?.name || 'Utility'}
                      </span>
                      <Link
                        to={`/product/${product.slug}`}
                        className="text-xs md:text-sm font-bold text-slate-900 hover:text-primary transition-colors line-clamp-2 mb-2"
                      >
                        {product.name}
                      </Link>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm md:text-base font-extrabold text-slate-900">
                          ₹{product.price?.toLocaleString()}
                        </span>
                        {product.compareAtPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{product.compareAtPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleMoveToCart(product)}
                        disabled={cartLoading}
                        leftIcon={<FiShoppingCart className="w-3.5 h-3.5" />}
                      >
                        Move to Cart
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
