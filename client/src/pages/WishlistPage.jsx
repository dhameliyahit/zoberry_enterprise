import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useUIStore } from '../store/uiStore';
import SEO from '../components/common/SEO';

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
      <div className="bg-[#f8fafc] min-h-screen py-16 flex items-center justify-center px-4">
        <SEO title="My Wishlist | Zoberry Enterprise" url="/wishlist" />
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center max-w-md w-full shadow-xs">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Save Your Favorite Items</h2>
          <p className="text-gray-500 text-xs md:text-sm mb-6">
            Log in to your Zoberry account to view and manage your saved wishlist items across devices.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="btn-primary w-full text-xs"
          >
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <SEO
        title="My Wishlist | Zoberry Enterprise"
        description="View and manage your saved favorite products."
        url="/wishlist"
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="pb-6 border-b border-gray-200 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary tracking-tight">
              My Wishlist
            </h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              {wishlist.length > 0 ? `${wishlist.length} item(s) saved` : 'Your wishlist is empty'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-xs">Loading your wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart size={30} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No items saved yet</h2>
            <p className="text-gray-500 text-xs mb-6">
              Browse our catalog and click the heart icon on products you want to save for later.
            </p>
            <Link to="/products" className="btn-primary inline-flex text-xs">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((product) => {
              const rawImg = product.images?.[0];
              const imageUrl = rawImg
                ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`)
                : 'https://placehold.co/300x300?text=No+Image';

              return (
                <div
                  key={product.id}
                  className="bg-white rounded border border-gray-100 shadow-xs hover:border-gray-200 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative">
                    <Link to={`/product/${product.slug}`} className="block aspect-[4/5] bg-gray-50">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-gray-400 hover:text-red-500 flex items-center justify-center shadow-xs transition-colors"
                      title="Remove from wishlist"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        {product.category?.name || 'Utility'}
                      </span>
                      <Link
                        to={`/product/${product.slug}`}
                        className="text-xs md:text-sm font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2 mb-2"
                      >
                        {product.name}
                      </Link>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm md:text-base font-extrabold text-secondary">
                          Rs. {product.price?.toLocaleString()}
                        </span>
                        {product.compareAtPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            Rs. {product.compareAtPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={cartLoading}
                        className="w-full btn-outline py-2.5 text-xs"
                      >
                        <FiShoppingCart size={13} /> Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
