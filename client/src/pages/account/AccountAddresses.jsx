import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import {
  GET_MY_ADDRESSES,
  CREATE_ADDRESS,
  UPDATE_ADDRESS,
  DELETE_ADDRESS,
  SET_DEFAULT_SHIPPING_ADDRESS,
} from '../../graphql/address';
import Modal from '../../components/common/Modal';
import { useUIStore } from '../../store/uiStore';

const AccountAddresses = () => {
  const { addToast } = useUIStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    addressType: 'HOME',
    isDefaultShipping: true,
    isDefaultBilling: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const { data, loading, error, refetch } = useQuery(GET_MY_ADDRESSES);
  const addresses = data?.getMyAddresses || [];

  const [createAddress, { loading: creating }] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => {
      addToast('Address created successfully!', 'success');
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => {
      addToast(err.message?.replace('GraphQL error: ', ''), 'error');
    },
  });

  const [updateAddress, { loading: updating }] = useMutation(UPDATE_ADDRESS, {
    onCompleted: () => {
      addToast('Address updated successfully!', 'success');
      setIsModalOpen(false);
      setEditingId(null);
      refetch();
    },
    onError: (err) => {
      addToast(err.message?.replace('GraphQL error: ', ''), 'error');
    },
  });

  const [deleteAddress] = useMutation(DELETE_ADDRESS, {
    onCompleted: () => {
      addToast('Address deleted', 'info');
      refetch();
    },
    onError: (err) => {
      addToast(err.message || 'Failed to delete address', 'error');
    },
  });

  const [setDefaultShipping] = useMutation(SET_DEFAULT_SHIPPING_ADDRESS, {
    onCompleted: () => {
      addToast('Default shipping address updated', 'success');
      refetch();
    },
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || 'IN',
      addressType: addr.addressType || 'HOME',
      isDefaultShipping: addr.isDefaultShipping,
      isDefaultBilling: addr.isDefaultBilling,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
      addToast('Please fill in all required address fields', 'error');
      return;
    }

    if (editingId) {
      updateAddress({
        variables: {
          id: editingId,
          input: formData,
        },
      });
    } else {
      createAddress({
        variables: {
          input: formData,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
          <p className="text-gray-500 text-xs mt-1">Manage your delivery and billing locations</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary py-2.5 px-4 text-xs">
          <FiPlus size={14} /> Add New Address
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-md mx-auto">
          <FiMapPin className="text-gray-300 mx-auto mb-3" size={36} />
          <h3 className="text-sm font-bold text-gray-800 mb-1">No Addresses Saved Yet</h3>
          <p className="text-xs text-gray-500 mb-4">Add your shipping address for quicker checkouts.</p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs">
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-lg border p-5 relative flex flex-col justify-between transition-all ${
                addr.isDefaultShipping ? 'border-primary shadow-xs ring-1 ring-primary/20' : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded uppercase">
                      {addr.addressType}
                    </span>
                    {addr.isDefaultShipping && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 rounded uppercase">
                        Default Shipping
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                      title="Edit address"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteAddress({ variables: { id: addr.id } })}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete address"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FiUser size={14} className="text-gray-400" />
                  {addr.fullName}
                </div>
                <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                  <FiPhone size={13} className="text-gray-400" />
                  {addr.phone}
                </div>

                <div className="text-xs text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
                  <div>{addr.addressLine1}</div>
                  {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                  {addr.landmark && <div>Landmark: {addr.landmark}</div>}
                  <div>
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </div>
                  <div className="text-gray-400 text-[11px] mt-0.5">{addr.country}</div>
                </div>
              </div>

              {!addr.isDefaultShipping && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setDefaultShipping({ variables: { id: addr.id } })}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Set as Default Shipping
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 max-w-lg w-full bg-white rounded">
          <h3 className="text-lg font-bold text-secondary mb-4 pb-2 border-b border-gray-100">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="Flat / House / Building No, Street"
                className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Area / Sector"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near temple/school"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="Pincode"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="HOME"
                  checked={formData.addressType === 'HOME'}
                  onChange={() => setFormData({ ...formData, addressType: 'HOME' })}
                  className="accent-primary"
                />
                Home
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="WORK"
                  checked={formData.addressType === 'WORK'}
                  onChange={() => setFormData({ ...formData, addressType: 'WORK' })}
                  className="accent-primary"
                />
                Work / Office
              </label>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || updating}
                className="btn-primary py-2 px-5 text-xs"
              >
                {creating || updating ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AccountAddresses;
