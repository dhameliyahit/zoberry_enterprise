import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiHeart, FiUser, FiShoppingCart, FiX } from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';

const Header = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { openCart, openAuthModal, user } = useUIStore();
  const currentPath = location.pathname;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Shop Info', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md bg-primary">
      <div className="py-2.5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-3 lg:gap-6">
            
            {/* 1. Logo Area */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img
                src="/zoberry_logo.png"
                alt="Zoberry Enterprise"
                className="h-8 sm:h-9 lg:h-11 object-contain origin-left"
                onError={(e) => {
                  e.target.src = '/logo.svg';
                }}
              />
            </Link>

            {/* 2. Simple Navigation Links (Immediately after Logo) */}
            <nav className="hidden lg:flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
                      isActive 
                        ? 'text-amber-400 bg-white/10 font-bold' 
                        : 'text-white/85 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Search Bar (After Nav Links) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md relative group shadow-sm">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search products, organizers, decor..."
                className="w-full pl-3.5 pr-20 py-2 bg-white rounded text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              
              {searchText && (
                <button 
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-10 top-0 h-full px-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              )}

              <button 
                type="submit" 
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-accent transition-colors bg-white rounded-r border-l border-gray-100 cursor-pointer"
                title="Search"
              >
                <FiSearch size={16} />
              </button>
            </form>

            {/* 4. Action Icons Area (Right Side) */}
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
              <Link to="/products" className="p-2 text-white/90 hover:text-white transition-colors md:hidden" title="Search">
                <FiSearch size={20} />
              </Link>

              <Link to="/wishlist" className="relative p-2 text-white/90 hover:text-white transition-colors" title="Wishlist">
                <FiHeart size={20} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-amber-400 rounded-full border-2 border-[#0f4c81]"></span>
              </Link>

              {user ? (
                <Link to="/profile" className="p-2 text-white/90 hover:text-white transition-colors flex items-center gap-1.5" title="Profile">
                  <FiUser size={20} />
                  <span className="hidden 2xl:block text-xs font-bold uppercase tracking-wide">{user.email.split('@')[0]}</span>
                </Link>
              ) : (
                <button onClick={openAuthModal} className="p-2 text-white/90 hover:text-white transition-colors cursor-pointer" title="Login / Register">
                  <FiUser size={20} />
                </button>
              )}

              <button onClick={openCart} className="relative flex items-center p-2 text-white/90 hover:text-white transition-colors cursor-pointer" title="Cart">
                <FiShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-amber-400 text-[#0f4c81] text-[10px] font-black h-4.5 w-4.5 flex items-center justify-center rounded-full border-2 border-[#0f4c81] shadow-sm">
                  0
                </span>
              </button>
            </div>

          </div>

          {/* Medium Screens (tablet) Nav Strip fallback */}
          <nav className="hidden md:flex lg:hidden items-center space-x-2 pt-2 border-t border-white/10 mt-2 overflow-x-auto whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1 rounded text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'text-amber-400 bg-white/10 font-bold' 
                      : 'text-white/85 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
};

export default Header;
