import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ArrowRight, Folder } from 'lucide-react';
import { GET_ALL_CATEGORIES } from '../../graphql/products';
import { getImageUrl } from '../../utils/imageUrl';
import { Skeleton } from '../ui/Skeleton';

export function CategorySlider() {
  const { data, loading } = useQuery(GET_ALL_CATEGORIES);
  const categories = (data?.getAllCategories || []).filter((c) => c.isActive !== false);

  if (loading) {
    return (
      <section className="py-6 sm:py-8 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-100 flex flex-col items-center gap-2">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="w-16 h-3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => {
            const hasImage = Boolean(category.imageUrl);
            const imgUrl = getImageUrl(category.imageUrl);

            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/60 hover:bg-blue-50/40 border border-slate-200 hover:border-primary/40 transition-all"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center mb-2 group-hover:border-primary group-hover:scale-105 transition-all shadow-2xs">
                  {hasImage ? (
                    <img
                      src={imgUrl}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Folder className="w-6 h-6 text-primary" />
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-primary line-clamp-1 transition-colors">
                  {category.name}
                </span>
                {category.productCount !== undefined && category.productCount > 0 && (
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategorySlider;
