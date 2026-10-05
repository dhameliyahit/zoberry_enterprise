import React, { useState, useRef } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
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
  const toast = useRef(null);
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

  const confirmDelete = (category) => {
    confirmDialog({
      message: `Are you sure you want to delete ${category.name}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteCategory({ variables: { id: category.id } });
          toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
          refetch();
        } catch (err) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
        }
      }
    });
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
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Name and Slug are required', life: 3000 });
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
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
      } else {
        if (!uploadedImageUrl) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Image is required for new category', life: 3000 });
            setLoading(false);
            return;
        }
        await createCategory({
          variables: { name: formData.name, slug: formData.slug, imageUrl: uploadedImageUrl }
        });
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Category Created', life: 3000 });
      }

      setDrawerVisible(false);
      refetch();
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
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
        <Button icon="pi pi-pencil" rounded outlined className="mr-2 w-8 h-8 p-0" onClick={() => editCategory(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" className="w-8 h-8 p-0" onClick={() => confirmDelete(rowData)} />
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
          <p className="text-sm text-gray-500">Manage product categories</p>
        </div>
        <Button label="Add Category" icon="pi pi-plus" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2" onClick={openNew} />
      </div>

      <DataTable value={data?.getAllCategories || []} loading={fetching} paginator rows={10} className="p-datatable-sm p-datatable-striped" emptyMessage="No categories found.">
        <Column body={imageBodyTemplate} header="Image" style={{ width: '10%' }}></Column>
        <Column field="name" header="Name" sortable style={{ width: '30%' }}></Column>
        <Column field="slug" header="Slug" sortable style={{ width: '30%' }}></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ width: '20%' }}></Column>
      </DataTable>

      <Sidebar visible={drawerVisible} position="right" onHide={() => setDrawerVisible(false)} className="w-full md:w-[400px]">
        <h3 className="text-xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Category' : 'New Category'}</h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <InputText 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\\s+/g, '-') })} 
              placeholder="Enter Category Name"
              className="w-full p-inputtext-sm border-gray-300 rounded-md" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <InputText 
              value={formData.slug} 
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
              placeholder="Enter Category Slug"
              className="w-full p-inputtext-sm border-gray-300 rounded-md" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors relative">
              <div className="space-y-1 text-center">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded" />
                ) : (
                  <i className="pi pi-image text-gray-400 text-3xl mb-2"></i>
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
          <Button label="Cancel" icon="pi pi-times" className="p-button-text text-gray-600" onClick={() => setDrawerVisible(false)} />
          <Button label="Save" icon="pi pi-check" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2" onClick={saveCategory} loading={loading} />
        </div>
      </Sidebar>
    </div>
  );
};

export default AdminCategories;
