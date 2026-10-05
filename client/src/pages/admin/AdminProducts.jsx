import React, { useState, useRef } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
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
  const toast = useRef(null);
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

  const confirmDelete = (product) => {
    confirmDialog({
      message: `Are you sure you want to delete ${product.name}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteProduct({ variables: { id: product.id } });
          toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
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

  const saveProduct = async () => {
    if (!formData.name || !formData.slug || !formData.categoryId || !formData.price) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Name, Slug, Category, and Price are required', life: 3000 });
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
        // Replace existing images or append. For simplicity, just use single image array for now
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
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
      } else {
        await createProduct({ variables: payload });
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
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
        <Button icon="pi pi-pencil" rounded outlined className="mr-2 w-8 h-8 p-0" onClick={() => editProduct(rowData)} />
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
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-sm text-gray-500">Manage your catalog</p>
        </div>
        <Button label="Add Product" icon="pi pi-plus" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2" onClick={openNew} />
      </div>

      <DataTable value={prodData?.getAllProducts || []} loading={fetching} paginator rows={10} className="p-datatable-sm p-datatable-striped" emptyMessage="No products found.">
        <Column body={imageBodyTemplate} header="Image" style={{ width: '10%' }}></Column>
        <Column field="name" header="Name" sortable style={{ width: '25%' }}></Column>
        <Column field="category.name" header="Category" sortable style={{ width: '15%' }}></Column>
        <Column body={priceBodyTemplate} header="Price" sortable style={{ width: '10%' }}></Column>
        <Column body={costPriceBodyTemplate} header="Cost" sortable style={{ width: '10%' }}></Column>
        <Column field="stockQuantity" header="Stock" sortable style={{ width: '5%' }}></Column>
        <Column body={statusBodyTemplate} header="Status" style={{ width: '10%' }}></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ width: '15%' }}></Column>
      </DataTable>

      <Sidebar visible={drawerVisible} position="right" onHide={() => setDrawerVisible(false)} className="w-full md:w-[500px]">
        <h3 className="text-xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Product' : 'New Product'}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <InputText 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\\s+/g, '-') })} 
                placeholder="Enter Product Name"
                className="w-full p-inputtext-sm border-gray-300 rounded-md" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <InputText 
                value={formData.slug} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                placeholder="Enter Product Slug"
                className="w-full p-inputtext-sm border-gray-300 rounded-md" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Dropdown 
                value={formData.categoryId} 
                options={catData?.getAllCategories || []} 
                onChange={(e) => setFormData({ ...formData, categoryId: e.value })} 
                optionLabel="name" 
                optionValue="id"
                placeholder="Select a Category" 
                className="w-full p-dropdown-sm border-gray-300 rounded-md" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <InputNumber 
                value={formData.price} 
                onValueChange={(e) => setFormData({ ...formData, price: e.value })} 
                placeholder="Enter Product Price"
                className="w-full border-gray-300 rounded-md"
                inputClassName="p-inputtext-sm w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
              <InputNumber 
                value={formData.costPrice} 
                onValueChange={(e) => setFormData({ ...formData, costPrice: e.value })} 
                placeholder="Enter Cost Price"
                className="w-full border-gray-300 rounded-md"
                inputClassName="p-inputtext-sm w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <InputNumber 
                value={formData.stockQuantity} 
                onValueChange={(e) => setFormData({ ...formData, stockQuantity: e.value })} 
                placeholder="Enter Stock Quantity"
                className="w-full border-gray-300 rounded-md"
                inputClassName="p-inputtext-sm w-full"
              />
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center">
                <Checkbox inputId="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.checked })} />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active</label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <InputTextarea 
              value={formData.shortDescription} 
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} 
              rows={3} 
              placeholder="Enter Short Description"
              className="w-full p-inputtext-sm border-gray-300 rounded-md" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
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
          <Button label="Save" icon="pi pi-check" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2" onClick={saveProduct} loading={loading} />
        </div>
      </Sidebar>
    </div>
  );
};

export default AdminProducts;
