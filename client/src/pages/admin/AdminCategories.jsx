import React, { useState, useRef } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FiPlus, FiTrash, FiEdit, FiCheck } from 'react-icons/fi';
import axios from 'axios';

const GET_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories { id name slug imageUrl createdAt }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $slug: String!, $imageUrl: String!) {
    createCategory(name: $name, slug: $slug, imageUrl: $imageUrl) { id }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $name: String, $slug: String, $imageUrl: String) {
    updateCategory(id: $id, name: $name, slug: $slug, imageUrl: $imageUrl) { id }
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

  const [formData, setFormData] = useState({ id: null, name: '', slug: '', imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data, loading: fetching, refetch } = useQuery(GET_CATEGORIES);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const openNew = () => {
    setFormData({ id: null, name: '', slug: '', imageUrl: '' });
    setSelectedFile(null);
    setPreviewImage(null);
    setIsEditing(false);
    setDrawerVisible(true);
  };

  const editCategory = (category) => {
    setFormData({ ...category });
    setSelectedFile(null);
    setPreviewImage(category.imageUrl ? `${API_URL}${category.imageUrl}` : null);
    setIsEditing(true);
    setDrawerVisible(true);
  };

  const confirmDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
      try {
        await deleteCategory({ variables: { id: category.id } });
        alert('Category Deleted');
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

  const saveCategory = async () => {
    if (!formData.name || !formData.slug) {
      alert('Name and Slug are required');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = formData.imageUrl;

      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedFile);
        formDataUpload.append('folder', 'categories');
        const uploadRes = await axios.post(`${API_URL}/api/upload`, formDataUpload);
        uploadedImageUrl = uploadRes.data.imageUrl;
      }

      if (isEditing) {
        await updateCategory({
          variables: { id: formData.id, name: formData.name, slug: formData.slug, imageUrl: uploadedImageUrl }
        });
        alert('Category Updated');
      } else {
        if (!uploadedImageUrl) {
          alert('Image is required for new category');
          setLoading(false);
          return;
        }
        await createCategory({
          variables: { name: formData.name, slug: formData.slug, imageUrl: uploadedImageUrl }
        });
        alert('Category Created');
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
    return rowData.imageUrl ? (
      <img src={`${API_URL}${rowData.imageUrl}`} alt={rowData.name} className="h-12 w-12 object-cover rounded shadow-sm border" />
    ) : <span>No Image</span>;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <button className="mr-2 w-8 h-8 p-0 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm" onClick={() => editCategory(rowData)}>
          <FiEdit />
        </button>
        <button className="w-8 h-8 p-0 rounded bg-red-100 hover:bg-red-200 flex items-center justify-center text-sm text-red-600" onClick={() => confirmDelete(rowData)}>
          <FiTrash />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow mx-4" style={{ display: 'none' }} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
          <p className="text-sm text-gray-500">Manage product categories</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={openNew}><FiPlus /> Add Category</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.getAllCategories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="p-3">{category.imageUrl ? <img src={`${API_URL}${category.imageUrl}`} alt={category.name} className="h-12 w-12 object-cover rounded" /> : 'No Image'}</td>
                <td className="p-3">{category.name}</td>
                <td className="p-3">{category.slug}</td>
                <td className="p-3">
                  <button className="mr-2 text-blue-600 hover underline">Edit</button>
                  <button className="text-red-600 hover underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full md:w-[400px] rounded-lg bg-gray-50 p-6 shadow">
        <h3 className="text-xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Category' : 'New Category'}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
              placeholder="Enter Category Name"
              className="w-full border-gray-300 rounded-md p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input 
              value={formData.slug} 
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
              placeholder="Enter Category Slug"
              className="w-full border-gray-300 rounded-md p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
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
          <button label="Cancel" className="text-gray-600" onClick={() => setDrawerVisible(false)}>Cancel</button>
          <button label="Save" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={saveCategory} disabled={loading}><FiCheck /> Save</button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;