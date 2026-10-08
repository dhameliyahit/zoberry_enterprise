import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Trash2, Edit2, Check, MapPin, Phone, User, Home, Building2 } from 'lucide-react';
import {
  GET_MY_ADDRESSES,
  CREATE_ADDRESS,
  UPDATE_ADDRESS,
  DELETE_ADDRESS,
  SET_DEFAULT_SHIPPING_ADDRESS,
} from '../../graphql/address';
import { useUIStore } from '../../store/uiStore';
import { Button, Input, Card, CardBody, Badge, Modal } from '../../components/ui';

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
          <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>
          <p className="text-slate-500 text-xs mt-0.5">Manage your delivery and billing locations</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Address
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-medium">Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No Addresses Saved Yet</h3>
          <p className="text-xs text-slate-500 mb-4">Add your shipping address for quicker checkouts.</p>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            Add Your First Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`p-5 relative flex flex-col justify-between transition-all ${
                addr.isDefaultShipping ? 'border-primary shadow-xs ring-1 ring-primary/20' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={addr.addressType === 'HOME' ? 'blue' : 'gray'} size="sm">
                      {addr.addressType}
                    </Badge>
                    {addr.isDefaultShipping && (
                      <Badge variant="green" size="sm">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                      title="Edit address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAddress({ variables: { id: addr.id } })}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {addr.fullName}
                </div>
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {addr.phone}
                </div>

                <div className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-slate-100 pt-3">
                  <div>{addr.addressLine1}</div>
                  {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                  {addr.landmark && <div>Landmark: {addr.landmark}</div>}
                  <div>
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{addr.country}</div>
                </div>
              </div>

              {!addr.isDefaultShipping && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setDefaultShipping({ variables: { id: addr.id } })}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Set as Default Shipping
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name *"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
            <Input
              label="Phone Number *"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="10-digit mobile"
            />
          </div>

          <Input
            label="Address Line 1 *"
            required
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            placeholder="Flat / House / Building No, Street"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Address Line 2 (Optional)"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              placeholder="Area / Sector"
            />
            <Input
              label="Landmark (Optional)"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="Near landmark"
            />
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <Input
              label="City *"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
            />
            <Input
              label="State *"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="State"
            />
            <Input
              label="Pincode *"
              required
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="Pincode"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={creating || updating}
            >
              {editingId ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountAddresses;
