import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { FiSearch, FiX, FiChevronRight, FiSliders } from 'react-icons/fi';
import { ProductCard } from '../components/products/ProductCard';
import { ProductCardSkeleton, EmptyState, Button } from '../components/ui';
import SEO from '../components/common/SEO';
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES } from '../graphql/products';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: routeCategorySlug } = useParams();

  const urlCategory = routeCategorySlug || searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    if (routeCategorySlug) {
      setSelectedCategory(routeCategorySlug);
    } else if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category'));
    } else {
      setSelectedCategory('');
    }
  }, [routeCategorySlug, searchParams]);

  useEffect(() => {
    if (searchParams.get('search') !== null) {
      setSearchTerm(searchParams.get('search') || '');
    }
  }, [searchParams]);

  const { data: catData, loading: catLoading } = useQuery(GET_ALL_CATEGORIES);
  const { data: prodData, loading: prodLoading } = useQuery(GET_ALL_PRODUCTS);

  const categories = (catData?.getAllCategories || []).filter((c) => c.isActive !== false);
  const products = prodData?.getAllProducts || [];

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.isActive !== false);

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q) ||
          p.optionsLabel?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter(
        (p) => p.category?.slug === selectedCategory || p.categoryId === selectedCategory
      );
    }

    // In Stock filter
    if (inStockOnly) {
      list = list.filter((p) => p.stockQuantity === null || p.stockQuantity > 0);
    }

    // Sorting
    if (sortBy === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list = [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }

    return list;
  }, [products, searchTerm, selectedCategory, sortBy, inStockOnly]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val) {
      searchParams.set('search', val);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const resetAllFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const pageTitle = activeCategoryObj
    ? `${activeCategoryObj.name} | Zoberry Enterprise`
    : searchTerm
    ? `Search results for "${searchTerm}" | Zoberry Enterprise`
    : 'All Products | Zoberry Enterprise';

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16">
      <SEO
        title={pageTitle}
        description="Explore our complete collection of innovative home utility gadgets, kitchen organizers, and daily essentials at direct warehouse prices."
        url="/products"
      />

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-6 sm:py-8">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
          <nav className="flex items-center justify-center text-xs text-slate-500 mb-2 gap-1.5">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <FiChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate">
              {activeCategoryObj ? activeCategoryObj.name : 'All Products'}
            </span>
          </nav>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
            {activeCategoryObj ? activeCategoryObj.name : 'Home & Kitchen Utilities'}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            {activeCategoryObj?.description ||
              'Discover problem-solver products, smart organizers, and daily essentials engineered for modern living.'}
          </p>

          {/* Search Bar */}
          <div className="mt-4 relative max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by product name or keyword..."
              className="w-full pl-9 pr-8 py-2 bg-[#f8fafc] border border-slate-200 rounded-[2px] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary transition-colors"
            />
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-5">
        {/* Category Pills & Sorting Bar */}
        <div className="bg-white p-3 sm:p-3.5 rounded-[2px] border border-slate-200 shadow-2xs mb-5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => handleCategoryChange('')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-[#1863dc] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-[#1863dc] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Controls: In Stock & Sort */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 text-xs">
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary rounded-[2px] cursor-pointer"
              />
              <span className="font-semibold text-xs">In Stock Only</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-[2px] px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        {prodLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="We could not find any products matching your active filters. Try searching for another term or clearing filters."
            actionLabel="Reset Filters"
            onAction={resetAllFilters}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
