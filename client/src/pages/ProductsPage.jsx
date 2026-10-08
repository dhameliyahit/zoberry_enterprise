import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { FiSearch, FiX, FiFilter, FiCheck, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../components/products/ProductCard';
import SEO from '../components/common/SEO';
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES } from '../graphql/products';

const ProductsPage = () => {
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

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
          (p.category && p.category.name.toLowerCase().includes(q)) ||
          (p.optionsLabel && p.optionsLabel.toLowerCase().includes(q))
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

  const pageTitle = activeCategoryObj
    ? `${activeCategoryObj.name} | Zoberry Enterprise`
    : searchTerm
    ? `Search Results for "${searchTerm}" | Zoberry Enterprise`
    : 'Shop Home & Kitchen Utility Products | Zoberry Enterprise';

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <SEO
        title={pageTitle}
        description="Explore our complete collection of innovative home utility gadgets, kitchen organizers, and daily essentials."
        url="/products"
      />

      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-2xl">
          <nav className="flex items-center justify-center text-xs text-gray-500 mb-3 gap-1">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <FiChevronRight size={12} className="text-gray-400" />
            <span className="text-gray-800 font-semibold">
              {activeCategoryObj ? activeCategoryObj.name : 'All Products'}
            </span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-extrabold text-secondary tracking-tight mb-2">
            {activeCategoryObj ? activeCategoryObj.name : 'Home & Kitchen Utilities'}
          </h1>
          <p className="text-gray-500 text-xs md:text-sm">
            {activeCategoryObj?.description ||
              'Discover problem-solver products, smart organizers, and daily essentials made for modern living.'}
          </p>

          {/* Search bar */}
          <div className="mt-5 relative max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search products by name or keyword..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-primary transition-all shadow-xs"
            />
            <FiSearch className="absolute left-3.5 top-3 text-gray-400" size={15} />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <FiX size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pt-6">
        {/* Category Pills & Sorting Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-white p-3 md:p-4 rounded border border-gray-200 shadow-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                !selectedCategory
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 text-xs">
            <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-primary"
              />
              <span>In Stock Only</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-700 bg-white outline-none focus:border-primary"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {prodLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-xs">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3">
              <FiSearch size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No Products Found</h3>
            <p className="text-gray-500 text-xs mb-6">
              We couldn't find any products matching your selected filters. Try clearing your search or category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
                setInStockOnly(false);
              }}
              className="btn-primary text-xs"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
