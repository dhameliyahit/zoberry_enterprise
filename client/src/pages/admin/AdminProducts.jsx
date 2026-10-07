import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiImage, FiVideo, FiX, FiPackage, FiLayers, FiDollarSign } from 'react-icons/fi';
import axios from 'axios';

const GET_PRODUCTS = gql`
  query GetAllProducts {
    getAllProducts {
      id
      name
      slug
      shortDescription
      description
      price
      costPrice
      compareAtPrice
      images
      stockQuantity
      isActive
      optionsLabel
      productVideoUrl
      features
      categoryId
      category {
        id
        name
      }
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $categoryId: ID!
    $name: String!
    $slug: String!
    $price: Float!
    $costPrice: Float
    $compareAtPrice: Float
    $stockQuantity: Int
    $shortDescription: String
    $description: String
    $optionsLabel: String
    $productVideoUrl: String
    $features: [String]
    $images: [String]
    $isActive: Boolean
  ) {
    createProduct(
      categoryId: $categoryId
      name: $name
      slug: $slug
      price: $price
      costPrice: $costPrice
      compareAtPrice: $compareAtPrice
      stockQuantity: $stockQuantity
      shortDescription: $shortDescription
      description: $description
      optionsLabel: $optionsLabel
      productVideoUrl: $productVideoUrl
      features: $features
      images: $images
      isActive: $isActive
    ) {
      id
      name
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: ID!
    $categoryId: ID
    $name: String
    $slug: String
    $price: Float
    $costPrice: Float
    $compareAtPrice: Float
    $stockQuantity: Int
    $shortDescription: String
    $description: String
    $optionsLabel: String
    $productVideoUrl: String
    $features: [String]
    $images: [String]
    $isActive: Boolean
  ) {
    updateProduct(
      id: $id
      categoryId: $categoryId
      name: $name
      slug: $slug
      price: $price
      costPrice: $costPrice
      compareAtPrice: $compareAtPrice
      stockQuantity: $stockQuantity
      shortDescription: $shortDescription
      description: $description
      optionsLabel: $optionsLabel
      productVideoUrl: $productVideoUrl
      features: $features
      images: $images
      isActive: $isActive
    ) {
      id
      name
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const AdminProducts = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    id: null,
    name: '',
    slug: '',
    categoryId: '',
    price: '',
    costPrice: '',
    compareAtPrice: '',
    stockQuantity: 0,
    shortDescription: '',
    description: '',
    optionsLabel: '',
    productVideoUrl: '',
    featuresText: '',
    isActive: true,
    images: []
  };

  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data: catData } = useQuery(GET_CATEGORIES);
  const { data: prodData, loading: fetching, refetch } = useQuery(GET_PRODUCTS);

  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const openNew = () => {
    setFormData(initialForm);
    setSelectedFile(null);
    setPreviewImage(null);
    setIsEditing(false);
    setDrawerVisible(true);
  };

  const editProduct = (product) => {
    setFormData({
      id: product.id,
      name: product.name || '',
      slug: product.slug || '',
      categoryId: product.categoryId || '',
      price: product.price !== undefined && product.price !== null ? product.price : '',
      costPrice: product.costPrice !== undefined && product.costPrice !== null ? product.costPrice : '',
      compareAtPrice: product.compareAtPrice !== undefined && product.compareAtPrice !== null ? product.compareAtPrice : '',
      stockQuantity: product.stockQuantity || 0,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      optionsLabel: product.optionsLabel || '',
      productVideoUrl: product.productVideoUrl || '',
      featuresText: Array.isArray(product.features) ? product.features.join('\n') : '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      images: product.images || []
    });
    setSelectedFile(null);
    const mainImg = product.images && product.images.length > 0 ? product.images[0] : null;
    setPreviewImage(mainImg ? (mainImg.startsWith('http') ? mainImg : `${API_URL}${mainImg}`) : null);
    setIsEditing(true);
    setDrawerVisible(true);
  };

  const confirmDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      try {
        await deleteProduct({ variables: { id: product.id } });
        alert('Product deleted successfully');
        refetch();
      } catch (err) {
        alert(err.message || 'Error deleting product');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    setFormData({
      ...formData,
      name,
      slug: isEditing ? formData.slug : slug
    });
  };

  const saveProduct = async () => {
    if (!formData.name.trim() || !formData.slug.trim() || !formData.categoryId || formData.price === '') {
      alert('Name, Slug, Category, and Price are required');
      return;
    }

    setLoading(true);
    try {
      let productImages = formData.images || [];

      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedFile);
        formDataUpload.append('folder', 'products');
        const uploadRes = await axios.post(`${API_URL}/api/upload`, formDataUpload);
        productImages = [uploadRes.data.imageUrl];
      }

      const featuresArray = formData.featuresText
        ? formData.featuresText.split('\n').map(f => f.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice !== '' ? parseFloat(formData.costPrice) : null,
        compareAtPrice: formData.compareAtPrice !== '' ? parseFloat(formData.compareAtPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        shortDescription: formData.shortDescription.trim() || null,
        description: formData.description.trim() || null,
        optionsLabel: formData.optionsLabel.trim() || null,
        productVideoUrl: formData.productVideoUrl.trim() || null,
        features: featuresArray,
        images: productImages,
        isActive: formData.isActive
      };

      if (isEditing) {
        await updateProduct({ variables: { id: formData.id, ...payload } });
        alert('Product updated successfully');
      } else {
        await createProduct({ variables: payload });
        alert('Product created successfully');
      }

      setDrawerVisible(false);
      refetch();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const products = prodData?.getAllProducts || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiPackage className="text-blue-600" /> Products Catalog
          </h2>
          <p className="text-sm text-gray-500">Manage Home & Kitchen utilities, decor, pricing & video showcases</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm cursor-pointer"
          onClick={openNew}
        >
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Selling Price</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">MRP / Compare</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Video</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fetching && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">Loading catalog...</td>
              </tr>
            )}
            {!fetching && products.length === 0 && (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FiPackage size={36} className="text-gray-300 mb-2" />
                    <p className="font-medium text-gray-600">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Product" to add your home and kitchen utility items.</p>
                  </div>
                </td>
              </tr>
            )}
            {products.map((product) => {
              const rawImg = product.images && product.images.length > 0 ? product.images[0] : null;
              const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : null;

              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name} className="h-12 w-12 object-cover rounded-md shadow-sm border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border flex-shrink-0">
                          <FiImage size={18} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1">{product.name}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600 font-medium">
                    {product.category?.name || <span className="text-gray-400 italic">Uncategorized</span>}
                  </td>
                  <td className="p-3 text-sm font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="p-3 text-sm text-gray-400">
                    {product.compareAtPrice ? (
                      <span className="line-through">{formatCurrency(product.compareAtPrice)}</span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${product.stockQuantity > 5 ? 'bg-emerald-50 text-emerald-700' : product.stockQuantity > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {product.productVideoUrl ? (
                      <a
                        href={product.productVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded"
                        title={product.productVideoUrl}
                      >
                        <FiVideo size={13} /> Video Added
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">None</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Edit Product"
                        className="w-8 h-8 rounded bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                        onClick={() => editProduct(product)}
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        title="Delete Product"
                        className="w-8 h-8 rounded bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                        onClick={() => confirmDelete(product)}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer / Product Form */}
      {drawerVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-end z-50 transition-opacity" onClick={() => setDrawerVisible(false)}>
          <div
            className="bg-white w-full sm:w-[560px] h-full shadow-2xl flex flex-col transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-gray-500">Fill in product details, utility features, video & pricing</p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => setDrawerVisible(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Drawer Form Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Product Title / Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. 2-in-1 Smart Oil Dispenser & Spray Bottle"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Slug */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">SEO Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. smart-oil-dispenser-spray-bottle"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Category *</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || '' })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Select Category</option>
                    {catData?.getAllCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Options / Badge Label */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Badge / Option Label</label>
                  <input
                    type="text"
                    value={formData.optionsLabel}
                    onChange={(e) => setFormData({ ...formData, optionsLabel: e.target.value })}
                    placeholder="e.g. Best Seller, Free Size, Set of 3"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 299"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-emerald-600"
                  />
                </div>

                {/* Compare at Price / MRP */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">MRP / Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="e.g. 599"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-500"
                  />
                </div>

                {/* Internal Cost Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Cost Price (Admin Only ₹)</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="e.g. 120"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Available Stock</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    placeholder="100"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Product Video URL (New Key as Requested) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FiVideo className="text-purple-600" /> Product Video URL (Demo / Reels / MP4 / YouTube)
                  </label>
                  <input
                    type="url"
                    value={formData.productVideoUrl}
                    onChange={(e) => setFormData({ ...formData, productVideoUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://cdn.example.com/demo.mp4"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Add a live demo video link to increase customer conversion & trust on Google & product page</p>
                </div>

                {/* Short Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Short Summary (For Google & Cards)</label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="High utility, durable kitchen tool designed for easy everyday cooking and cleaning."
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Key Features Bullet Points */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Key Highlights / Features (1 per line)</label>
                  <textarea
                    rows={3}
                    value={formData.featuresText}
                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                    placeholder={"Food-Grade Stainless Steel & BPA Free\nLeakproof & Easy to Clean\nSpace-Saving Compact Design"}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Full Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed explanation of product usage, materials, dimensions, and benefits."
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Product Image */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Main Product Image *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-center">
                    {previewImage ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-36 w-36 object-contain rounded-lg shadow-sm border border-gray-200 mb-3 bg-gray-50"
                        />
                        <label className="cursor-pointer bg-white px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-blue-600 hover:bg-gray-50 shadow-xs">
                          Change Image
                          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                      </div>
                    ) : (
                      <div className="py-4 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                          <FiImage size={24} />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Upload High-Quality Product Image</p>
                        <p className="text-xs text-gray-400 mb-3">Square 1:1 or 4:5 ratio recommended (PNG, JPG, WebP)</p>
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-medium shadow-xs transition-colors">
                          Browse File
                          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Status */}
                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="productIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="productIsActive" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Publish Product (Active on Storefront & Search)
                  </label>
                </div>

              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                type="button"
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md font-medium transition-colors cursor-pointer"
                onClick={() => setDrawerVisible(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                onClick={saveProduct}
                disabled={loading}
              >
                <FiCheck size={16} />
                {loading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
