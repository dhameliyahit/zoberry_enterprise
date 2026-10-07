import React from 'react';
import SEO from '../components/common/SEO';
import { FiCheckCircle, FiTruck, FiShield, FiHeart } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className="bg-[#f8fafc] min-h-screen py-12">
      <SEO
        title="About Us"
        description="Learn more about Zoberry Enterprise, your trusted source for smart living, innovative home & kitchen utility gadgets, and easy decor."
        url="/about"
      />
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xs border border-gray-200">
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
            About Zoberry Enterprise
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-secondary mb-6">
            Smart Living, Delivered to Your Doorstep
          </h1>

          <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
            <p>
              Welcome to <strong>Zoberry Enterprise</strong>! We are dedicated to bringing you the most innovative, functional, and aesthetic home and kitchen utility products. Our mission is to make daily household tasks simpler, faster, and more enjoyable through smart design.
            </p>
            <p>
              From clever kitchen organizers and space-saving gadgets to easy home decor and daily essentials, we carefully source and curate products that solve real everyday problems at honest prices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-10 border-t border-gray-100">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <FiShield size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Quality Guaranteed</h3>
              <p className="text-xs text-gray-500">Every product is tested and verified for long-lasting durability.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiTruck size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Fast Shipping</h3>
              <p className="text-xs text-gray-500">Quick dispatch with reliable doorstep delivery across India.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiHeart size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Customer First</h3>
              <p className="text-xs text-gray-500">Dedicated support via WhatsApp and phone for complete peace of mind.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
