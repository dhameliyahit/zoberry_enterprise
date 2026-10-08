import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { GET_ALL_PRODUCTS } from '../../graphql/products';

export function FeaturedProducts() {
  const { data, loading } = useQuery(GET_ALL_PRODUCTS, {
    variables: { limit: 8 },
  });

  const products = (data?.getAllProducts || []).filter((p) => p.isActive !== false).slice(0, 8);

  return (
    <section className="py-10 sm:py-16 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1 block">
              Handpicked Essentials
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No featured products available at this time.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
