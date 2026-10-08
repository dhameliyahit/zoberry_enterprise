import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiTag, FiCalendar,
  FiPercent, FiDollarSign, FiSearch, FiLayers, FiActivity, FiUsers, FiClock
} from 'react-icons/fi';
import {
  ADMIN_GET_ALL_PROMOTIONS,
  ADMIN_CREATE_PROMOTION,
  ADMIN_UPDATE_PROMOTION,
  ADMIN_TOGGLE_PROMOTION_ACTIVE,
  ADMIN_DELETE_PROMOTION,
} from '../../graphql/promotions';
import { useUIStore } from '../../store/uiStore';

const AdminPromotions = () => {
  const { addToast } = useUIStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const initialForm = {
    id: null,
    code: '',
    name: '',
    description: '',
    type: 'COUPON',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumSubtotal: '',
    maximumDiscount: '',
    startsAt: '',
    endsAt: '',
    usageLimit: '',
    perCustomerLimit: '1',
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');

  // Fetch Promotions
  const { data, loading, refetch } = useQuery(ADMIN_GET_ALL_PROMOTIONS, {
    variables: {
      filter: {
        search: searchQuery.trim() || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true',
        type: typeFilter || undefined,
      },
      pagination: {
        page,
        limit,
      },
    },
    fetchPolicy: 'network-only',
  });

  const [createPromotion, { loading: creating }] = useMutation(ADMIN_CREATE_PROMOTION);
  const [updatePromotion, { loading: updating }] = useMutation(ADMIN_UPDATE_PROMOTION);
  const [toggleActive] = useMutation(ADMIN_TOGGLE_PROMOTION_ACTIVE);
  const [deletePromotion] = useMutation(ADMIN_DELETE_PROMOTION);

  const promotions = data?.adminGetAllPromotions?.promotions || [];
  const totalCount = data?.adminGetAllPromotions?.totalCount || 0;
  const totalPages = data?.adminGetAllPromotions?.totalPages || 1;

  // Open Create Modal
  const handleOpenNew = () => {
    setFormData(initialForm);
    setFormError('');
    setIsEditing(false);
    setModalVisible(true);
  };

  // Open Edit Modal
  const handleEdit = (promo) => {
    setFormData({
      id: promo.id,
      code: promo.code || '',
      name: promo.name || '',
      description: promo.description || '',
      type: promo.type || 'COUPON',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: promo.discountValue?.toString() || '',
      minimumSubtotal: promo.minimumSubtotal?.toString() || '',
      maximumDiscount: promo.maximumDiscount?.toString() || '',
      startsAt: promo.startsAt ? new Date(promo.startsAt).toISOString().slice(0, 16) : '',
      endsAt: promo.endsAt ? new Date(promo.endsAt).toISOString().slice(0, 16) : '',
      usageLimit: promo.usageLimit?.toString() || '',
      perCustomerLimit: promo.perCustomerLimit?.toString() || '1',
      isActive: promo.isActive,
    });
    setFormError('');
    setIsEditing(true);
    setModalVisible(true);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Promotion name is required.');
      return;
    }

    if (formData.type === 'COUPON' && !formData.code.trim()) {
      setFormError('Coupon code is required for coupon promotions.');
      return;
    }

    const discountVal = parseFloat(formData.discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      setFormError('Discount value must be a positive number.');
      return;
    }

    if (formData.discountType === 'PERCENTAGE' && discountVal > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    try {
      const input = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        discountType: formData.discountType,
        discountValue: discountVal,
        minimumSubtotal: formData.minimumSubtotal ? parseFloat(formData.minimumSubtotal) : 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : undefined,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : undefined,
        perCustomerLimit: formData.perCustomerLimit ? parseInt(formData.perCustomerLimit, 10) : 1,
        isActive: formData.isActive,
      };

      if (formData.type === 'COUPON') {
        input.code = formData.code.trim().toUpperCase();
      }

      if (isEditing) {
        await updatePromotion({
          variables: {
            id: formData.id,
            input,
          },
        });
        addToast('Promotion updated successfully!', 'success');
      } else {
        await createPromotion({
          variables: { input },
        });
        addToast('Promotion created successfully!', 'success');
      }

      setModalVisible(false);
      refetch();
    } catch (err) {
      setFormError(err.message?.replace('GraphQL error: ', '') || 'An error occurred while saving.');
    }
  };

  // Quick Toggle Active Status
  const handleToggle = async (promo) => {
    try {
      await toggleActive({
        variables: {
          id: promo.id,
          isActive: !promo.isActive,
        },
      });
      addToast(`Promotion "${promo.name}" is now ${!promo.isActive ? 'Active' : 'Inactive'}.`, 'info');
      refetch();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to update status', 'error');
    }
  };

  // Delete Promotion
  const handleDelete = async (promo) => {
    if (window.confirm(`Are you sure you want to delete promotion "${promo.name}" (${promo.code || 'Auto'})?`)) {
      try {
        await deletePromotion({ variables: { id: promo.id } });
        addToast('Promotion deleted successfully.', 'success');
        refetch();
      } catch (err) {
        addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to delete promotion', 'error');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiTag className="text-blue-600" /> Promotions & Coupons
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure coupons, percentage & fixed discounts, usage caps, and pricing rules.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <FiPlus size={18} /> Create Promotion
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by promotion name or coupon code..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-gray-50/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="COUPON">Coupon Code</option>
            <option value="AUTOMATIC">Automatic Discount</option>
          </select>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Coupon / Name</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min. Subtotal</th>
                <th className="py-3.5 px-4">Usage / Limit</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Loading promotions...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No promotions found matching your search.
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => {
                  const isExpired = promo.endsAt && new Date(promo.endsAt) < new Date();
                  const isUpcoming = promo.startsAt && new Date(promo.startsAt) > new Date();

                  return (
                    <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {promo.code ? (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold rounded border border-blue-200 tracking-wider">
                              {promo.code}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                              AUTO
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-gray-900 block">{promo.name}</span>
                            {promo.description && (
                              <span className="text-[11px] text-gray-400 block line-clamp-1">
                                {promo.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">
                          {promo.discountType === 'PERCENTAGE'
                            ? `${promo.discountValue}% OFF`
                            : `Rs. ${promo.discountValue} OFF`}
                        </div>
                        {promo.maximumDiscount > 0 && promo.discountType === 'PERCENTAGE' && (
                          <div className="text-[11px] text-gray-400">
                            Cap: Rs. {promo.maximumDiscount}
                          </div>
                        )}
                      </td>

                      {/* Min Subtotal */}
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {promo.minimumSubtotal > 0 ? `Rs. ${promo.minimumSubtotal.toLocaleString()}` : 'No minimum'}
                      </td>

                      {/* Usage / Limit */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">
                          {promo.usageCount}
                          <span className="font-normal text-gray-400">
                            {promo.usageLimit ? ` / ${promo.usageLimit}` : ' (Unlimited)'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Limit/user: {promo.perCustomerLimit || 1}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4">
                        {promo.endsAt ? (
                          <div>
                            <span className="block text-gray-700 font-medium">
                              Until {new Date(promo.endsAt).toLocaleDateString()}
                            </span>
                            {isExpired && (
                              <span className="text-[10px] text-red-500 font-bold uppercase">Expired</span>
                            )}
                            {isUpcoming && (
                              <span className="text-[10px] text-amber-500 font-bold uppercase">Starts Soon</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No Expiry</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(promo)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                            promo.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              promo.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(promo)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit promotion"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(promo)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete promotion"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {promotions.length} of {totalCount} promotions
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 font-medium"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-bold text-gray-900">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiTag className="text-blue-600" />
                {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
              </h3>
              <button
                onClick={() => setModalVisible(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <FiX size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mega Summer Sale 2026"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Promotion Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="COUPON">Coupon Code (Requires promo code)</option>
                    <option value="AUTOMATIC">Automatic (Applies directly)</option>
                  </select>
                </div>

                {/* Code */}
                {formData.type === 'COUPON' && (
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER50"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg font-mono font-bold uppercase tracking-wider outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Discount Type */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (Rs.)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '(Rs.)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 200'}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                {/* Minimum Subtotal */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Minimum Cart Subtotal (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumSubtotal}
                    onChange={(e) => setFormData({ ...formData, minimumSubtotal: e.target.value })}
                    placeholder="0 for no minimum"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                {/* Maximum Discount (Cap for Percentage) */}
                {formData.discountType === 'PERCENTAGE' && (
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                      Maximum Discount Cap (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maximumDiscount}
                      onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
                      placeholder="e.g. 500 (Optional)"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Global Usage Limit */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Total Global Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                {/* Per Customer Limit */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Limit Per Customer / Email
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perCustomerLimit}
                    onChange={(e) => setFormData({ ...formData, perCustomerLimit: e.target.value })}
                    placeholder="Default: 1"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                {/* Starts At */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Starts At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Ends At */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Ends At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-1">
                    Description / Public Terms
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. 15% off up to Rs. 500 on all orders above Rs. 999"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                {/* Active Toggle */}
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="promoIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="promoIsActive" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Promotion is Active and Redeemable
                  </label>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs disabled:bg-gray-400"
                >
                  {creating || updating ? 'Saving...' : isEditing ? 'Update Promotion' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
