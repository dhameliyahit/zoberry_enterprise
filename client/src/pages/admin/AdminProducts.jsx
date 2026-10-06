import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FiPlus, FiTrash, FiEdit, FiCheck, FiImage } from 'react-icons/fi';
import axios from 'axios';

const GET_PRODUCTS = gql`
  query GetAllProducts {
    getAllProducts {
      id name slug shortDescription description price costPrice compareAtPrice
      images stockQuantity isActive optionsLabel features categoryId
      category { id name }
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories { id name }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($categoryId: ID!, $name: String!, $slug: String!, $price: Float!, $costPrice: Float, $stockQuantity: Int, $shortDescription: String, $images: [String], $isActive: Boolean) {
    createProduct(categoryId: $categoryId, name: $name, slug: $slug, price: $price, costPrice: $costPrice, stockQuantity: $stockQuantity, shortDescription: $shortDescription, images: $images, isActive: $isActive) { id }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $categoryId: ID, $name: String, $slug: String, $price: Float, $costPrice: Float, $stockQuantity: Int, $shortDescription: String, $images: [String], $isActive: Boolean) {
    updateProduct(id: $id, categoryId: $categoryId, name: $name, slug: $slug, price: $price, costPrice: $costPrice, stockQuantity: $stockQuantity, shortDescription: $shortDescription, images: $images, isActive: $isActive) { id }
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
    id: null, name: '', slug: '', categoryId: null, price: null, costPrice: null,
    stockQuantity: 0, shortDescription: '', isActive: true, images: []
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
    setFormData({ ...product });
    setSelectedFile(null);
    setPreviewImage(product.images && product.images.length > 0 ? `${API_URL}${product.images[0]}` : null);
    setIsEditing(true);
    setDrawerVisible(true);
  };

  const confirmDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await deleteProduct({ variables: { id: product.id } });
        alert('Product Deleted');
        refetch();
      } catch (err) {
        alert(err.message);
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

  const saveProduct = async () => {
    if (!formData.name || !formData.slug || !formData.categoryId || !formData.price) {
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

      const payload = {
        name: formData.name,
        slug: formData.slug,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity, 10),
        shortDescription: formData.shortDescription,
        images: productImages,
        isActive: formData.isActive
      };

      if (isEditing) {
        await updateProduct({ variables: { id: formData.id, ...payload } });
        alert('Product Updated');
      } else {
        await createProduct({ variables: payload });
        alert('Product Created');
      }

      setDrawerVisible(false);
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const imageBodyTemplate = (rowData) => {
    const imgUrl = rowData.images && rowData.images.length > 0 ? `${API_URL}${rowData.images[0]}` : null;
    return imgUrl ? (
      <img src={imgUrl} alt={rowData.name} className="h-12 w-12 object-cover rounded shadow-sm border" />
    ) : <span className="text-xs text-gray-400">No Image</span>;
  };

  const priceBodyTemplate = (rowData) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(rowData.price);
  };

  const costPriceBodyTemplate = (rowData) => {
    return rowData.costPrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(rowData.costPrice) : '-';
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rowData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {rowData.isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <button className="mr-2 w-8 h-8 p-0 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm" onClick={() => editProduct(rowData)}>
          <FiEdit />
        </button>
        <button className="w-8 h-8 p-0 rounded bg-red-100 hover:bg-red-200 flex items-center justify-center text-sm text-red-600" onClick={() => confirmDelete(rowData)}>
          <FiTrash />
        </button>
      </div>
    );
  };

  const products = prodData?.getAllProducts || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow mx-4" style={{ display: 'none' }} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-sm text-gray-500">Manage your catalog</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2" onClick={openNew}><FiPlus /> Add Product</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetching && (
              <tr>
                <td colSpan="8" className="p-3 text-center text-gray-500">Loading...</td>
              </tr>
            )}
            {!fetching && products.length === 0 && (
              <tr>
                <td colSpan="8" className="p-3 text-center text-gray-500">No products found.</td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="p-3">{imageBodyTemplate(product)}</td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.category?.name || '-'}</td>
                <td className="p-3">{priceBodyTemplate(product)}</td>
                <td className="p-3">{costPriceBodyTemplate(product)}</td>
                <td className="p-3">{product.stockQuantity}</td>
                <td className="p-3">{statusBodyTemplate(product)}</td>
                <td className="p-3">{actionBodyTemplate(product)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50" onClick={() => setDrawerVisible(false)}>
          <div 
            className="bg-white w-full md:w-[500px] h-full shadow-xl transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'New Product'}</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setDrawerVisible(false)}>Close</button>
              </div>
            
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
                      placeholder="Enter Product Name"
                      className="w-full border-gray-300 rounded-md p-2" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input 
                      value={formData.slug} 
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                      placeholder="Enter Product Slug"
                      className="w-full border-gray-300 rounded-md p-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={formData.categoryId || ''} 
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value, 10) : null })} 
                      className="w-full border-gray-300 rounded-md p-2" 
                    >
                      <option value="">Select a Category</option>
                      {catData?.getAllCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input 
                      type="number"
                      value={formData.price !== null && formData.price !== undefined ? formData.price : ''} 
                      onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })} 
                      placeholder="Enter Product Price"
                      className="w-full border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
                    <input 
                      type="number"
                      value={formData.costPrice !== null && formData.costPrice !== undefined ? formData.costPrice : ''} 
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value ? parseFloat(e.target.value) : null })} 
                      placeholder="Enter Cost Price"
                      className="w-full border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input 
                      type="number"
                      value={formData.stockQuantity} 
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })} 
                      placeholder="Enter Stock Quantity"
                      className="w-full border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center">
                      <input 
                        id="isActive" 
                        type="checkbox"
                        checked={formData.isActive} 
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active</label>
                    </div>
                  </div>
                </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea 
                    value={formData.shortDescription} 
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} 
                    rows={3} 
                    placeholder="Enter Short Description"
                    className="w-full border-gray-300 rounded-md p-2" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors relative">
                    <div className="space-y-1 text-center">
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded" />
                      ) : (
                        <FiImage className="text-gray-400 text-3xl mb-2" />
                      )}
                      <div className="flex text-sm text-gray-600 justify-center mt-4">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>{previewImage ? 'Change Image' : 'Upload a file'}</span>
                          <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                <button className="text-gray-600 px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2" onClick={() => setDrawerVisible(false)}>Cancel</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2" onClick={saveProduct} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
