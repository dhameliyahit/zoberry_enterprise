import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { FiArrowRight } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';
import { ProductCard } from '../products/ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { GET_ALL_PRODUCTS } from '../../graphql/products';

export function FeaturedProducts() {
  const { data, loading } = useQuery(GET_ALL_PRODUCTS, {
    variables: { limit: 8 },
  });

  const products = (data?.getAllProducts || []).filter((p) => p.isActive !== false).slice(0, 8);

  return (
    <section className="py-8 sm:py-10 bg-[#f8fafc] border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FaFire className="w-4 h-4 text-red-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
              Featured Products & Best Sellers
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline uppercase tracking-wider"
          >
            <span>View All ({products.length})</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No featured products available at this time.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
