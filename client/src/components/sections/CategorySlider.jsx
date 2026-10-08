import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ArrowRight } from 'lucide-react';
import { GET_ALL_CATEGORIES } from '../../graphql/products';
import { getImageUrl } from '../../utils/imageUrl';
import { Skeleton } from '../ui/Skeleton';

export function CategorySlider() {
  const { data, loading } = useQuery(GET_ALL_CATEGORIES);
  const categories = (data?.getAllCategories || []).filter((c) => c.isActive !== false);

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
                <Skeleton className="w-16 h-3.5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1 block">
              Curated Collections
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Grid / Scroll */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => {
            const imgUrl = getImageUrl(category.imageUrl);

            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-150"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs group-hover:border-primary group-hover:shadow-sm transition-all duration-200 mb-2.5">
                  <img
                    src={imgUrl}
                    alt={category.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-primary line-clamp-1 transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategorySlider;
