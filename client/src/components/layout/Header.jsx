import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch, FiHeart, FiUser, FiShoppingCart, FiX, FiMenu,
  FiShield, FiPackage, FiMapPin, FiLogOut
} from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';
import { useWishlist } from '../../hooks/useWishlist';

const Header = () => {
  const [searchText, setSearchText] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { openCart, openAuthModal, user, logout, cartCount, wishlistIds } = useUIStore();
  const currentPath = location.pathname;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchText.trim())}`);
      setIsMobileMenuOpen(false);
    } else {
      navigate('/products');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const wishlistCount = wishlistIds?.size || 0;

  return (
    <header className="sticky top-0 z-40 bg-primary shadow-md">
      <div className="py-2.5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-3 lg:gap-6">
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-white lg:hidden hover:bg-white/10 rounded"
              title="Toggle Menu"
            >
              <FiMenu size={22} />
            </button>

            {/* 1. Logo Area */}
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <img
                src="/zoberry_logo.png"
                alt="Zoberry Enterprise"
                className="h-8 sm:h-9 lg:h-10 object-contain origin-left brightness-0 invert"
                onError={(e) => {
                  e.target.src = '/logo.svg';
                }}
              />
            </Link>

            {/* 2. Primary Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-1 shrink-0">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-amber-300 bg-white/10 font-bold'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md relative shadow-xs"
            >
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search products, organizers, decor..."
                className="w-full pl-3.5 pr-16 py-2 bg-white rounded text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-9 top-0 h-full px-2 text-gray-400 hover:text-gray-700"
                >
                  <FiX size={14} />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-primary bg-white rounded-r border-l border-gray-100"
                title="Search"
              >
                <FiSearch size={15} />
              </button>
            </form>

            {/* 4. Action Icons Area */}
            <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
              {/* Mobile Search Icon */}
              <Link
                to="/products"
                className="p-2 text-white/90 hover:text-white md:hidden"
                title="Search"
              >
                <FiSearch size={20} />
              </Link>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2 text-white/90 hover:text-white transition-colors"
                title="Wishlist"
              >
                <FiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown / Login Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2 text-white/90 hover:text-white transition-colors flex items-center gap-1.5"
                    title="Account"
                  >
                    <FiUser size={20} />
                    <span className="hidden xl:block text-xs font-bold truncate max-w-[100px]">
                      {user.email.split('@')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg border border-gray-100 py-1 text-xs text-gray-700 z-50 animate-slide-up"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100 font-bold truncate text-gray-900">
                        {user.email}
                      </div>
                      <Link
                        to="/account?tab=orders"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                      >
                        <FiPackage size={14} /> My Orders
                      </Link>
                      <Link
                        to="/account?tab=addresses"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                      >
                        <FiMapPin size={14} /> Saved Addresses
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-primary font-bold border-t border-gray-50"
                        >
                          <FiShield size={14} /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left border-t border-gray-100 font-semibold"
                      >
                        <FiLogOut size={14} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="p-2 text-white/90 hover:text-white transition-colors"
                  title="Sign In / Register"
                >
                  <FiUser size={20} />
                </button>
              )}

              {/* Shopping Cart Button */}
              <button
                onClick={openCart}
                className="relative flex items-center p-2 text-white/90 hover:text-white transition-colors"
                title="Shopping Cart"
              >
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-gray-900 text-[10px] font-black h-4.5 w-4.5 flex items-center justify-center rounded-full border-2 border-primary shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-xl flex flex-col justify-between p-6 z-10 animate-slide-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <img src="/zoberry_logo.png" alt="Zoberry" className="h-8 object-contain" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 p-1">
                  <FiX size={20} />
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded text-sm font-bold text-gray-800 hover:bg-gray-50"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-outline w-full text-xs"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-xs font-bold text-red-600 py-2"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-primary w-full text-xs"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
