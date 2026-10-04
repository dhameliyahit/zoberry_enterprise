import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/assets/zoberry_logo.png" 
              alt="Zoberry Enterprise" 
              className="h-10 md:h-12 lg:h-14 object-contain brightness-0 invert origin-left" 
            />
          </Link>
          <p className="text-sm leading-relaxed pr-4">Your trusted destination for premium products. Experience quality and class with Zoberry Enterprise.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Customer Service</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
            <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Newsletter</h4>
          <p className="text-sm mb-4">Subscribe for the latest updates and exclusive offers.</p>
          <div className="flex">
            <input type="email" placeholder="Your email" className="px-3 py-2 w-full text-secondary rounded-l focus:outline-none" />
            <button className="bg-accent text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors font-medium">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-gray-700 text-sm text-center">
        &copy; {new Date().getFullYear()} Zoberry Enterprise. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
