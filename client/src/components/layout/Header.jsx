import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  FiSearch,
  FiHeart,
  FiUser,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiPackage,
  FiMapPin,
  FiLogOut,
  FiShield,
  FiChevronDown,
} from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { GET_ALL_CATEGORIES } from '../../graphql/products';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { openCart, openAuthModal, user, logout, cartCount, wishlistIds } = useUIStore();
  const { data: catData } = useQuery(GET_ALL_CATEGORIES);

  const categories = (catData?.getAllCategories || []).filter((c) => c.isActive !== false).slice(0, 6);
  const wishlistCount = wishlistIds?.size || 0;

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Main Warehouse Dark Header */}
      <div className="bg-[#0b1528] text-white border-b border-slate-800">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 md:gap-6">
            
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-[2px] transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center shrink-0 py-1">
              <img
                src="/zoberry_logo.png"
                alt="Zoberry Enterprise"
                className="h-8 sm:h-10 object-contain"
                onError={(e) => {
                  e.target.src = '/logo.svg';
                }}
              />
            </Link>

            {/* Integrated Warehouse Search Bar (Desktop & Tablet) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-xl xl:max-w-2xl items-stretch"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search home utilities, kitchen tools, organizers, gadgets..."
                  className="w-full h-11 bg-white text-slate-900 placeholder-slate-500 text-xs sm:text-sm pl-4 pr-9 rounded-l-[2px] border-y border-l border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                aria-label="Search"
                className="h-11 px-6 bg-[#1863dc] hover:bg-[#1351b4] text-white font-bold text-xs uppercase tracking-wider rounded-r-[2px] flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <FiSearch className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Action Controls: Wishlist, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              
              {/* Wishlist */}
              <Link
                to="/wishlist"
                aria-label="View Wishlist"
                className="relative flex items-center gap-1.5 p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-[2px] transition-colors"
              >
                <div className="relative">
                  <FiHeart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <div className="hidden xl:flex flex-col text-left text-[11px] leading-tight">
                  <span className="text-slate-400 text-[10px]">Saved</span>
                  <span className="font-semibold text-white">Wishlist</span>
                </div>
              </Link>

              {/* Account / User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-expanded={isUserMenuOpen}
                    aria-label="User account menu"
                    className="flex items-center gap-2 p-1.5 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-[2px] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-[2px] bg-[#1863dc] text-white flex items-center justify-center font-bold text-xs">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden xl:flex flex-col text-left text-[11px] leading-tight">
                      <span className="text-slate-400 text-[10px]">Account</span>
                      <span className="font-semibold text-white max-w-[100px] truncate">
                        {user.email?.split('@')[0]}
                      </span>
                    </div>
                    <FiChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-[#0e1930] rounded-[2px] shadow-2xl border border-slate-700 py-1.5 z-50 text-xs text-slate-300">
                      <div className="px-4 py-2.5 border-b border-slate-800">
                        <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                        <p className="font-semibold text-white truncate mt-0.5">{user.email}</p>
                      </div>

                      <Link
                        to="/account?tab=orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      >
                        <FiPackage className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/account?tab=addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      >
                        <FiMapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Addresses</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-blue-950/60 text-blue-400 font-semibold border-t border-slate-800 transition-colors"
                        >
                          <FiShield className="w-4 h-4 text-blue-400" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-red-400 hover:bg-red-950/40 border-t border-slate-800 font-medium transition-colors"
                      >
                        <FiLogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-[2px] transition-colors"
                  aria-label="Sign in"
                >
                  <FiUser className="w-5 h-5 text-slate-300" />
                  <div className="hidden xl:flex flex-col text-left text-[11px] leading-tight">
                    <span className="text-slate-400 text-[10px]">Hello, Sign in</span>
                    <span className="font-semibold text-white">My Account</span>
                  </div>
                </button>
              )}

              {/* Shopping Cart Trigger */}
              <button
                type="button"
                onClick={openCart}
                aria-label={`Shopping cart with ${cartCount} items`}
                className="flex items-center gap-2 h-11 px-3.5 bg-[#1863dc] hover:bg-[#1351b4] text-white rounded-[2px] text-xs font-bold transition-colors shadow-xs"
              >
                <div className="relative">
                  <FiShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-red-600 text-white text-[9px] font-black flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[10px] text-blue-100 font-normal">Cart</span>
                  <span className="text-xs font-bold">{cartCount} items</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Warehouse Department Sub-Navigation Bar */}
      <div className="hidden lg:block bg-[#111f38] text-slate-200 border-b border-slate-800/90 text-xs">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-1">
              <Link
                to="/products"
                className={`px-3 py-2 font-bold uppercase tracking-wider text-[11px] hover:text-white hover:bg-slate-800/60 rounded-[2px] transition-colors ${
                  location.pathname === '/products' && !location.search ? 'text-blue-400 bg-slate-800' : 'text-slate-200'
                }`}
              >
                All Departments
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="px-3 py-2 font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-[2px] transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 text-slate-300 text-xs font-medium">
              <Link to="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (under header for mobile screens) */}
      <div className="md:hidden bg-[#0b1528] px-4 pb-2.5">
        <form onSubmit={handleSearchSubmit} className="flex items-stretch">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search home utilities & essentials..."
            className="w-full h-9 bg-white text-slate-900 placeholder-slate-500 text-xs pl-3 pr-8 rounded-l-[2px] border-0 focus:outline-none"
          />
          <button
            type="submit"
            className="h-9 px-3 bg-[#1863dc] text-white rounded-r-[2px] flex items-center justify-center"
          >
            <FiSearch className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-4/5 max-w-xs bg-[#0b1528] text-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-slide-left border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <img src="/zoberry_logo.png" alt="Zoberry" className="h-7 object-contain" />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-[2px]"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Shop Departments
                </p>
                <Link
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-[2px] text-xs font-semibold text-slate-200 hover:bg-slate-800"
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-[2px] text-xs font-medium text-slate-300 hover:bg-slate-800"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center py-2 px-4 rounded-[2px] bg-slate-800 text-xs font-semibold text-white"
                  >
                    My Account ({user.email?.split('@')[0]})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-[2px]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Sign In / Register
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
