import React from 'react';
import ProductCard from '../products/ProductCard';

// Dummy data mirroring the backend schema fields
const dummyProducts = [
  {
    id: '1',
    name: 'Premium Leather Minimalist Wallet',
    slug: 'premium-leather-minimalist-wallet',
    price: 1299,
    compareAtPrice: 2499,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80'],
    optionsLabel: '3 Colors Available',
  },
  {
    id: '2',
    name: 'Ergonomic Aluminum Laptop Stand',
    slug: 'ergonomic-aluminum-laptop-stand',
    price: 1899,
    compareAtPrice: null,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80'],
    optionsLabel: 'Silver / Space Gray',
  },
  {
    id: '3',
    name: 'Bottle Umbrella (Mix Color)',
    slug: 'bottle-umbrella',
    price: 399,
    compareAtPrice: 799,
    images: ['https://images.unsplash.com/photo-1556484399-565b90f42df3?w=500&q=80'],
    optionsLabel: 'Mix Colors',
  },
  {
    id: '4',
    name: 'Smart Ceramic Coffee Mug with Warmer',
    slug: 'smart-ceramic-coffee-mug',
    price: 1499,
    compareAtPrice: 2999,
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80'],
    optionsLabel: 'Matte Black',
  }
];

const FeaturedProducts = () => {
  return (
    <section className="pt-8 pb-16 md:pt-10 md:pb-20 bg-[#f8fafc]">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-wider mb-2 block">
              Handpicked for you
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary tracking-tight">
              Trending Now
            </h2>
          </div>
          <button className="text-gray-500 hover:text-primary font-bold text-sm tracking-wide uppercase transition-colors border-b-2 border-transparent hover:border-primary pb-1">
            View Collection
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {dummyProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default FeaturedProducts;
