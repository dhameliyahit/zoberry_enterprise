import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { FiSearch, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';
import ProductCard from '../components/products/ProductCard';
import SEO from '../components/common/SEO';

const GET_ALL_CATALOG = gql`
  query GetCatalog {
    getAllProducts {
      id
      name
      slug
      shortDescription
      price
      compareAtPrice
      images
      stockQuantity
      optionsLabel
      isActive
      categoryId
      category {
        id
        name
        slug
      }
    }
    getAllCategories {
      id
      name
      slug
    }
  }
`;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');

  const { data, loading } = useQuery(GET_ALL_CATALOG);

  const categories = data?.getAllCategories || [];
  const products = data?.getAllProducts || [];

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.isActive !== false);

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
        (p.category && p.category.name.toLowerCase().includes(q)) ||
        (p.optionsLabel && p.optionsLabel.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter(p => 
        p.category?.slug === selectedCategory || p.categoryId === selectedCategory
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, searchTerm, selectedCategory, sortBy]);

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

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <SEO
        title="Shop Home & Kitchen Utility Products & Easy Decor"
        description="Explore our complete collection of innovative home utility gadgets, kitchen organizers, easy home decor and daily use problem solvers."
        keywords="home utility products, smart kitchen accessories, home decor india, daily use gadgets, best utility items online"
        url="/products"
      />

      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-secondary tracking-tight mb-2">
            Home & Kitchen Utilities
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Discover problem-solver products, smart organizers, and easy home decor made for modern living.
          </p>

          {/* Search bar */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search products by name or category..."
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
            />
            <FiSearch className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pt-8">
        
        {/* Category Pills & Sorting Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${!selectedCategory ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All Products ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat.slug ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-white outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
              <FiSearch size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Products Found</h3>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't find any products matching your search criteria. Try a different keyword or category.
            </p>
            <button
              onClick={() => { setSelectedCategory(''); setSearchTerm(''); }}
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
