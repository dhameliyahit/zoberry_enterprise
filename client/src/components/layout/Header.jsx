import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiUser, FiShoppingCart, FiX } from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';

const Header = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { openCart, openAuthModal, user } = useUIStore();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md flex flex-col bg-primary">
      <div className="py-2.5 border-b border-primary-hover">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Logo Area */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img
                src="/zoberry_logo.png"
                alt="Zoberry Enterprise"
                className="h-9 md:h-11 lg:h-12 object-contain origin-left"
                onError={(e) => {
                  e.target.src = '/logo.svg';
                }}
              />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl relative group shadow-sm ml-4">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search home & kitchen utility products, decor, organizers..."
                className="w-full pl-4 pr-24 py-2.5 bg-white border-none rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              
              {searchText && (
                <button 
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-12 top-0 h-full px-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              )}

              <button type="submit" className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-accent transition-colors bg-white rounded-r border-l border-gray-100 cursor-pointer">
                <FiSearch size={20} />
              </button>
            </form>

            {/* Icons Area */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/wishlist" className="relative p-2 text-white/90 hover:text-white transition-colors" title="Wishlist">
                <FiHeart size={22} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-amber-400 rounded-full border-2 border-[#0f4c81]"></span>
              </Link>

              {user ? (
                <Link to="/profile" className="p-2 text-white/90 hover:text-white transition-colors flex items-center gap-2" title="Profile">
                  <FiUser size={22} />
                  <span className="hidden lg:block text-xs font-bold uppercase tracking-wide">{user.email.split('@')[0]}</span>
                </Link>
              ) : (
                <button onClick={openAuthModal} className="p-2 text-white/90 hover:text-white transition-colors cursor-pointer" title="Login / Register">
                  <FiUser size={22} />
                </button>
              )}

              <button onClick={openCart} className="relative flex items-center p-2 text-white/90 hover:text-white transition-colors cursor-pointer" title="Cart">
                <FiShoppingCart size={22} />
                <span className="absolute -top-1 -right-1 bg-amber-400 text-[#0f4c81] text-[10px] font-bold h-4.5 w-4.5 flex items-center justify-center rounded-full border-2 border-[#0f4c81] shadow-sm">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links Row */}
      <nav className="bg-white border-b border-gray-100 hidden md:block shadow-[0_4px_10px_rgba(0,0,0,0.02)] z-40 relative">
        <div className="container mx-auto px-4 md:px-8">
          <ul className="flex items-center space-x-8 py-0">
            <li className="relative group flex items-center h-12">
              <Link to="/" className="text-gray-700 hover:text-primary font-bold tracking-wide text-sm h-full flex items-center transition-colors">
                Home
              </Link>
            </li>
            
            <li className="relative group flex items-center h-12">
              <Link to="/products" className="text-gray-700 hover:text-primary font-bold tracking-wide text-sm h-full flex items-center transition-colors">
                All Products
              </Link>
            </li>
            
            <li className="relative group flex items-center h-12">
              <Link to="/about" className="text-gray-600 hover:text-primary font-medium tracking-wide text-sm h-full flex items-center transition-colors">
                About Us
              </Link>
            </li>

            <li className="relative group flex items-center h-12">
              <Link to="/contact" className="text-gray-600 hover:text-primary font-medium tracking-wide text-sm h-full flex items-center transition-colors">
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
