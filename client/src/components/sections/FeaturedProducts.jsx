import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ProductCard from '../products/ProductCard';
import { GET_ALL_PRODUCTS } from '../../graphql/products';

const FeaturedProducts = () => {
  const { data, loading } = useQuery(GET_ALL_PRODUCTS, {
    variables: { limit: 8 },
  });

  const products = (data?.getAllProducts || []).filter((p) => p.isActive !== false).slice(0, 8);

  if (loading) {
    return (
      <section className="py-12 bg-[#f8fafc]">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-xs">Loading featured products...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="pt-6 pb-16 md:pb-20 bg-[#f8fafc]">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-200">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-wider mb-1 block">
              Handpicked Essentials
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-secondary tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-gray-600 hover:text-primary font-bold text-xs tracking-wider uppercase transition-colors"
          >
            View All ({products.length})
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
