import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  Package,
  MapPin,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../ui/Button';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { openCart, openAuthModal, user, logout, cartCount, wishlistIds } = useUIStore();

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

  const navLinks = [
    { name: 'All Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* 1. Brand Logo (White Logo on Dark Brand Header for High Contrast) */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 py-1">
            <img
              src="/zoberry_logo.png"
              alt="Zoberry Enterprise"
              className="h-8 sm:h-9 object-contain"
              onError={(e) => {
                e.target.src = '/logo.svg';
              }}
            />
          </Link>

          {/* 2. Global Product Search Bar (Desktop & Tablet) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md lg:max-w-lg xl:max-w-xl relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search home utilities, kitchen gadgets, organizers..."
              className="w-full bg-slate-900 text-white placeholder-slate-400 text-xs sm:text-sm pl-9 pr-8 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* 3. Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'text-white bg-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* 4. Action Controls: Search (Mobile), Wishlist, Account, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Link */}
            <Link
              to="/products"
              aria-label="Search products"
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              aria-label="View Wishlist"
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 -right-0.5 min-w-4 h-4 px-1 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-slate-950 shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Customer Account / Login Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-label="User account menu"
                  className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center font-bold text-xs">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden xl:block text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-1.5 z-50 text-xs text-slate-300 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                      <p className="font-semibold text-white truncate mt-0.5">{user.email}</p>
                    </div>

                    <Link
                      to="/account?tab=orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/account?tab=addresses"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Saved Addresses</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-primary/20 text-blue-400 font-semibold border-t border-slate-800 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-blue-400" />
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
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors"
                title="Sign in"
                aria-label="Sign in"
              >
                <User className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Shopping cart with ${cartCount} items`}
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 bg-white text-primary text-[10px] font-black flex items-center justify-center rounded-full ml-0.5">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-4/5 max-w-xs bg-slate-900 text-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-slide-left border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <img src="/zoberry_logo.png" alt="Zoberry" className="h-7 object-contain" />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mb-4 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-primary"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </form>

              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center py-2 px-4 rounded-lg bg-slate-800 text-xs font-semibold text-white"
                  >
                    My Account ({user.email?.split('@')[0]})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-lg"
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
