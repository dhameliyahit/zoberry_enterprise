import React from 'react';
import { gql, useQuery } from '@apollo/client';
import ProductCard from '../products/ProductCard';

const GET_FEATURED_PRODUCTS = gql`
  query GetAllProducts {
    getAllProducts {
      id name slug price compareAtPrice images optionsLabel
    }
  }
`;

const FeaturedProducts = () => {
  const { data, loading } = useQuery(GET_FEATURED_PRODUCTS);
  const products = data?.getAllProducts?.slice(0, 8) || [];

  if (loading) return null; // or a spinner

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
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No products available yet. Add some from the admin panel!
          </div>
        )}
        
      </div>
    </section>
  );
};

export default FeaturedProducts;
