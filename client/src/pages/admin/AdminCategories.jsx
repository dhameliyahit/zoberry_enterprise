import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiImage, FiX, FiFolder } from 'react-icons/fi';
import axios from 'axios';

const GET_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
      slug
      imageUrl
      createdAt
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $slug: String!, $imageUrl: String!) {
    createCategory(name: $name, slug: $slug, imageUrl: $imageUrl) {
      id
      name
      slug
      imageUrl
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $name: String, $slug: String, $imageUrl: String) {
    updateCategory(id: $id, name: $name, slug: $slug, imageUrl: $imageUrl) {
      id
      name
      slug
      imageUrl
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const AdminCategories = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialForm = { id: null, name: '', slug: '', imageUrl: '' };
  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data, loading: fetching, refetch } = useQuery(GET_CATEGORIES);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const openNew = () => {
    setFormData(initialForm);
    setSelectedFile(null);
    setPreviewImage(null);
    setIsEditing(false);
    setDrawerVisible(true);
  };

  const editCategory = (category) => {
    setFormData({
      id: category.id,
      name: category.name || '',
      slug: category.slug || '',
      imageUrl: category.imageUrl || ''
    });
    setSelectedFile(null);
    setPreviewImage(category.imageUrl ? (category.imageUrl.startsWith('http') ? category.imageUrl : `${API_URL}${category.imageUrl}`) : null);
    setIsEditing(true);
    setDrawerVisible(true);
  };

  const confirmDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      try {
        await deleteCategory({ variables: { id: category.id } });
        alert('Category deleted successfully');
        refetch();
      } catch (err) {
        alert(err.message || 'Error deleting category');
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

  const saveCategory = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('Category Name and Slug are required');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = formData.imageUrl;

      if (selectedFile) {
        const token = localStorage.getItem('token');
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedFile);
        formDataUpload.append('folder', 'categories');
        const uploadRes = await axios.post(`${API_URL}/api/upload`, formDataUpload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        uploadedImageUrl = uploadRes.data.imageUrl;
      }

      if (isEditing) {
        await updateCategory({
          variables: {
            id: formData.id,
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            imageUrl: uploadedImageUrl
          }
        });
        alert('Category updated successfully');
      } else {
        if (!uploadedImageUrl) {
          alert('Category image is required');
          setLoading(false);
          return;
        }
        await createCategory({
          variables: {
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            imageUrl: uploadedImageUrl
          }
        });
        alert('Category created successfully');
      }

      setDrawerVisible(false);
      refetch();
    } catch (err) {
      alert(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const categories = data?.getAllCategories || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiFolder className="text-blue-600" /> Categories
          </h2>
          <p className="text-sm text-gray-500">Organize your Home & Kitchen and Utility catalog</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm cursor-pointer"
          onClick={openNew}
        >
          <FiPlus size={18} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
              <th className="p-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
              <th className="p-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="p-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fetching && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">Loading categories...</td>
              </tr>
            )}
            {!fetching && categories.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FiFolder size={36} className="text-gray-300 mb-2" />
                    <p className="font-medium text-gray-600">No categories found</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Category" above to create your first category.</p>
                  </div>
                </td>
              </tr>
            )}
            {categories.map((category) => {
              const imgUrl = category.imageUrl
                ? (category.imageUrl.startsWith('http') ? category.imageUrl : `${API_URL}${category.imageUrl}`)
                : null;
              return (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5">
                    {imgUrl ? (
                      <img src={imgUrl} alt={category.name} className="h-12 w-12 object-cover rounded-md shadow-sm border border-gray-100" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border">
                        <FiImage size={20} />
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 font-medium text-gray-800">{category.name}</td>
                  <td className="p-3.5 text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block my-2">{category.slug}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Edit Category"
                        className="w-8 h-8 rounded bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                        onClick={() => editCategory(category)}
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        title="Delete Category"
                        className="w-8 h-8 rounded bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                        onClick={() => confirmDelete(category)}
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

      {/* Drawer / Modal */}
      {drawerVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-end z-50 transition-opacity" onClick={() => setDrawerVisible(false)}>
          <div
            className="bg-white w-full sm:w-[450px] h-full shadow-2xl flex flex-col transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => setDrawerVisible(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Kitchen Storage, Home Decor"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. kitchen-storage"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Used in URL for SEO (e.g. /category/kitchen-storage)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Image *</label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50/20 transition-all text-center">
                  {previewImage ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg shadow-sm border border-gray-200 mb-3"
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
                      <p className="text-sm font-medium text-gray-700 mb-1">Upload Category Icon / Image</p>
                      <p className="text-xs text-gray-400 mb-3">PNG, JPG, WebP up to 5MB</p>
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-medium shadow-xs transition-colors">
                        Browse File
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                  )}
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
                onClick={saveCategory}
                disabled={loading}
              >
                <FiCheck size={16} />
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
