import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  FiTruck, FiPercent, FiPlus, FiEdit2, FiTrash2,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiSave, FiX, FiRefreshCw
} from 'react-icons/fi';
import {
  ADMIN_GET_ALL_SHIPPING_METHODS,
  ADMIN_CREATE_SHIPPING_METHOD,
  ADMIN_UPDATE_SHIPPING_METHOD,
  ADMIN_TOGGLE_SHIPPING_METHOD_ACTIVE,
  GET_TAX_RULES,
  ADMIN_CREATE_TAX_RULE,
  ADMIN_UPDATE_TAX_RULE,
  ADMIN_TOGGLE_TAX_RULE_ACTIVE
} from '../../graphql/shipping';
import { useUIStore } from '../../store/uiStore';
import SEO from '../../components/common/SEO';

const AdminShipping = () => {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('shipping'); // 'shipping' | 'tax'

  // Shipping Method Queries & Mutations
  const {
    data: shippingData,
    loading: shippingLoading,
    error: shippingError,
    refetch: refetchShipping
  } = useQuery(ADMIN_GET_ALL_SHIPPING_METHODS, { fetchPolicy: 'network-only' });

  const [createShippingMethod, { loading: creatingShipping }] = useMutation(ADMIN_CREATE_SHIPPING_METHOD);
  const [updateShippingMethod, { loading: updatingShipping }] = useMutation(ADMIN_UPDATE_SHIPPING_METHOD);
  const [toggleShippingActive] = useMutation(ADMIN_TOGGLE_SHIPPING_METHOD_ACTIVE);

  // Tax Rule Queries & Mutations
  const {
    data: taxData,
    loading: taxLoading,
    error: taxError,
    refetch: refetchTax
  } = useQuery(GET_TAX_RULES, { fetchPolicy: 'network-only' });

  const [createTaxRule, { loading: creatingTax }] = useMutation(ADMIN_CREATE_TAX_RULE);
  const [updateTaxRule, { loading: updatingTax }] = useMutation(ADMIN_UPDATE_TAX_RULE);
  const [toggleTaxActive] = useMutation(ADMIN_TOGGLE_TAX_RULE_ACTIVE);

  // Shipping Method Form State
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [editingShippingId, setEditingShippingId] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    code: '',
    name: '',
    description: '',
    price: 99,
    freeThreshold: 999,
    estimatedDays: '3 - 5 business days',
    isActive: true,
    priority: 10,
  });

  // Tax Rule Form State
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [taxForm, setTaxForm] = useState({
    name: '',
    ratePercent: 5.0,
    isInclusive: true,
    isActive: true,
    country: 'IN',
    state: '',
  });

  // Handle open shipping modal
  const handleOpenShippingModal = (method = null) => {
    if (method) {
      setEditingShippingId(method.id);
      setShippingForm({
        code: method.code,
        name: method.name,
        description: method.description || '',
        price: method.price,
        freeThreshold: method.freeThreshold ?? '',
        estimatedDays: method.estimatedDays || '',
        isActive: method.isActive,
        priority: method.priority || 10,
      });
    } else {
      setEditingShippingId(null);
      setShippingForm({
        code: '',
        name: '',
        description: '',
        price: 99,
        freeThreshold: 999,
        estimatedDays: '3 - 5 business days',
        isActive: true,
        priority: 10,
      });
    }
    setShippingModalOpen(true);
  };

  // Handle open tax modal
  const handleOpenTaxModal = (rule = null) => {
    if (rule) {
      setEditingTaxId(rule.id);
      setTaxForm({
        name: rule.name,
        ratePercent: rule.ratePercent,
        isInclusive: rule.isInclusive,
        isActive: rule.isActive,
        country: rule.country || 'IN',
        state: rule.state || '',
      });
    } else {
      setEditingTaxId(null);
      setTaxForm({
        name: '',
        ratePercent: 5.0,
        isInclusive: true,
        isActive: true,
        country: 'IN',
        state: '',
      });
    }
    setTaxModalOpen(true);
  };

  // Handle submit shipping form
  const handleSaveShipping = async (e) => {
    e.preventDefault();
    try {
      const input = {
        code: shippingForm.code.trim().toUpperCase(),
        name: shippingForm.name.trim(),
        description: shippingForm.description.trim() || undefined,
        price: parseFloat(shippingForm.price) || 0,
        freeThreshold: shippingForm.freeThreshold !== '' && shippingForm.freeThreshold !== null
          ? parseFloat(shippingForm.freeThreshold)
          : null,
        estimatedDays: shippingForm.estimatedDays.trim() || undefined,
        isActive: Boolean(shippingForm.isActive),
        priority: parseInt(shippingForm.priority, 10) || 10,
      };

      if (editingShippingId) {
        await updateShippingMethod({
          variables: { id: editingShippingId, input },
        });
        addToast('Shipping method updated successfully.', 'success');
      } else {
        await createShippingMethod({
          variables: { input },
        });
        addToast('Shipping method created successfully.', 'success');
      }

      setShippingModalOpen(false);
      refetchShipping();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to save shipping method.', 'error');
    }
  };

  // Handle submit tax form
  const handleSaveTax = async (e) => {
    e.preventDefault();
    try {
      const input = {
        name: taxForm.name.trim(),
        ratePercent: parseFloat(taxForm.ratePercent) || 0,
        isInclusive: Boolean(taxForm.isInclusive),
        isActive: Boolean(taxForm.isActive),
        country: (taxForm.country || 'IN').trim().toUpperCase(),
        state: taxForm.state?.trim() || undefined,
      };

      if (editingTaxId) {
        await updateTaxRule({
          variables: { id: editingTaxId, input },
        });
        addToast('Tax rule updated successfully.', 'success');
      } else {
        await createTaxRule({
          variables: { input },
        });
        addToast('Tax rule created successfully.', 'success');
      }

      setTaxModalOpen(false);
      refetchTax();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to save tax rule.', 'error');
    }
  };

  // Handle toggle shipping active
  const handleToggleShipping = async (id) => {
    try {
      await toggleShippingActive({ variables: { id } });
      addToast('Shipping status updated.', 'info');
      refetchShipping();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to toggle status.', 'error');
    }
  };

  // Handle toggle tax active
  const handleToggleTax = async (id) => {
    try {
      await toggleTaxActive({ variables: { id } });
      addToast('Tax status updated.', 'info');
      refetchTax();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to toggle status.', 'error');
    }
  };

  const shippingMethods = shippingData?.adminGetAllShippingMethods || [];
  const taxRules = taxData?.getTaxRules || [];

  return (
    <div className="space-y-6">
      <SEO title="Shipping & Tax Settings | Zoberry Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Shipping & Tax Configuration</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage provider-independent delivery methods, free-shipping thresholds, and GST tax rules.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'shipping'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiTruck size={14} /> Shipping Methods ({shippingMethods.length})
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tax'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiPercent size={14} /> Tax Rules ({taxRules.length})
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: SHIPPING METHODS ===================== */}
      {activeTab === 'shipping' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Available Delivery Methods</h2>
              <p className="text-xs text-gray-500">
                Configure rates, transit times, and free shipping subtotal thresholds.
              </p>
            </div>
            <button
              onClick={() => handleOpenShippingModal()}
              className="btn-primary py-2 px-3 text-xs inline-flex items-center gap-1.5"
            >
              <FiPlus size={14} /> Add Shipping Method
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Code / Name</th>
                    <th className="py-3 px-4">Standard Rate</th>
                    <th className="py-3 px-4">Free Threshold</th>
                    <th className="py-3 px-4">Est. Delivery</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shippingLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        Loading shipping methods...
                      </td>
                    </tr>
                  ) : shippingMethods.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No custom shipping methods configured. System using defaults (STANDARD ₹99 / FREE on ₹999+, EXPRESS ₹199).
                      </td>
                    </tr>
                  ) : (
                    shippingMethods.map((method) => (
                      <tr key={method.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          <div>{method.name}</div>
                          <span className="text-[10px] font-mono text-gray-400 block uppercase">
                            {method.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-800">
                          Rs. {method.price}
                        </td>
                        <td className="py-3.5 px-4">
                          {method.freeThreshold !== null && method.freeThreshold !== undefined ? (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Free on Rs. {method.freeThreshold}+
                            </span>
                          ) : (
                            <span className="text-gray-400">No Free Tier</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {method.estimatedDays || 'Standard Transit'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-600">
                          {method.priority}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleShipping(method.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1 ${
                              method.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {method.isActive ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                            {method.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenShippingModal(method)}
                            className="text-primary hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="Edit method"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: TAX RULES ===================== */}
      {activeTab === 'tax' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Configurable Tax Rules (GST)</h2>
              <p className="text-xs text-gray-500">
                Standard GST rate applied to consumer pricing (tax-inclusive default).
              </p>
            </div>
            <button
              onClick={() => handleOpenTaxModal()}
              className="btn-primary py-2 px-3 text-xs inline-flex items-center gap-1.5"
            >
              <FiPlus size={14} /> Add Tax Rule
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Rule Name</th>
                    <th className="py-3 px-4">Rate (%)</th>
                    <th className="py-3 px-4">Pricing Model</th>
                    <th className="py-3 px-4">Country / Region</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {taxLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        Loading tax rules...
                      </td>
                    </tr>
                  ) : taxRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        No custom tax rules. System using Standard GST (5% Inclusive).
                      </td>
                    </tr>
                  ) : (
                    taxRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          {rule.name}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-800">
                          {rule.ratePercent}%
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rule.isInclusive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {rule.isInclusive ? 'Tax-Inclusive (Consumer Price)' : 'Tax-Exclusive (Added at checkout)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {rule.country || 'IN'} {rule.state ? `(${rule.state})` : '(All States)'}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleTax(rule.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1 ${
                              rule.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {rule.isActive ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenTaxModal(rule)}
                            className="text-primary hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="Edit rule"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT/CREATE SHIPPING METHOD ===================== */}
      {shippingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FiTruck className="text-primary" />
                {editingShippingId ? 'Edit Shipping Method' : 'Create Shipping Method'}
              </h3>
              <button
                onClick={() => setShippingModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShipping} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Code * (e.g. STANDARD, EXPRESS)
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.code}
                  onChange={(e) => setShippingForm({ ...shippingForm, code: e.target.value.toUpperCase() })}
                  placeholder="STANDARD"
                  className="w-full px-3 py-2 border border-gray-200 rounded font-mono uppercase outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.name}
                  onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                  placeholder="Standard Delivery"
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={shippingForm.description}
                  onChange={(e) => setShippingForm({ ...shippingForm, description: e.target.value })}
                  placeholder="Safe and reliable ground delivery"
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={shippingForm.price}
                    onChange={(e) => setShippingForm({ ...shippingForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Free Threshold (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingForm.freeThreshold}
                    onChange={(e) => setShippingForm({ ...shippingForm, freeThreshold: e.target.value })}
                    placeholder="999 (Leave blank if none)"
                    className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Estimated Transit
                  </label>
                  <input
                    type="text"
                    value={shippingForm.estimatedDays}
                    onChange={(e) => setShippingForm({ ...shippingForm, estimatedDays: e.target.value })}
                    placeholder="3 - 5 business days"
                    className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Display Priority
                  </label>
                  <input
                    type="number"
                    value={shippingForm.priority}
                    onChange={(e) => setShippingForm({ ...shippingForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shippingActive"
                  checked={shippingForm.isActive}
                  onChange={(e) => setShippingForm({ ...shippingForm, isActive: e.target.checked })}
                  className="accent-primary"
                />
                <label htmlFor="shippingActive" className="text-gray-700 font-semibold cursor-pointer">
                  Active (available at checkout)
                </label>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShippingModalOpen(false)}
                  className="btn-outline py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingShipping || updatingShipping}
                  className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                >
                  <FiSave size={13} /> {editingShippingId ? 'Update Method' : 'Create Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT/CREATE TAX RULE ===================== */}
      {taxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FiPercent className="text-primary" />
                {editingTaxId ? 'Edit Tax Rule' : 'Create Tax Rule'}
              </h3>
              <button
                onClick={() => setTaxModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTax} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Tax Name *
                </label>
                <input
                  type="text"
                  required
                  value={taxForm.name}
                  onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })}
                  placeholder="Standard GST"
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Rate Percent (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={taxForm.ratePercent}
                    onChange={(e) => setTaxForm({ ...taxForm, ratePercent: e.target.value })}
                    placeholder="5.0"
                    className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    value={taxForm.country}
                    onChange={(e) => setTaxForm({ ...taxForm, country: e.target.value.toUpperCase() })}
                    placeholder="IN"
                    className="w-full px-3 py-2 border border-gray-200 rounded uppercase outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="taxInclusive"
                    checked={taxForm.isInclusive}
                    onChange={(e) => setTaxForm({ ...taxForm, isInclusive: e.target.checked })}
                    className="accent-primary"
                  />
                  <label htmlFor="taxInclusive" className="text-gray-700 font-semibold cursor-pointer">
                    Tax-Inclusive (Prices in store already include this tax)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="taxActive"
                    checked={taxForm.isActive}
                    onChange={(e) => setTaxForm({ ...taxForm, isActive: e.target.checked })}
                    className="accent-primary"
                  />
                  <label htmlFor="taxActive" className="text-gray-700 font-semibold cursor-pointer">
                    Active Rule
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTaxModalOpen(false)}
                  className="btn-outline py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTax || updatingTax}
                  className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                >
                  <FiSave size={13} /> {editingTaxId ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipping;
