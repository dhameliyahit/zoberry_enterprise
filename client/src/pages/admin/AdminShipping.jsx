import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  FiTruck, FiPercent, FiPlus, FiEdit2, FiTrash2,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiSave, FiX, FiRefreshCw,
  FiPackage, FiNavigation, FiClock, FiMapPin, FiActivity
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
import {
  ADMIN_GET_ALL_SHIPMENTS,
  ADMIN_CREATE_SHIPMENT,
  ADMIN_UPDATE_SHIPMENT_STATUS,
  ADMIN_CANCEL_SHIPMENT,
  ADMIN_ADD_TRACKING_EVENT
} from '../../graphql/fulfillment';
import { useUIStore } from '../../store/uiStore';
import SEO from '../../components/common/SEO';

const AdminShipping = () => {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('fulfillment'); // 'fulfillment' | 'shipping' | 'tax'

  // ===================== FULFILLMENT / SHIPMENT DATA =====================
  const [shipmentFilterStatus, setShipmentFilterStatus] = useState('');
  const {
    data: shipmentsData,
    loading: shipmentsLoading,
    refetch: refetchShipments
  } = useQuery(ADMIN_GET_ALL_SHIPMENTS, {
    variables: { status: shipmentFilterStatus || undefined, limit: 100 },
    fetchPolicy: 'network-only',
  });

  const [createShipmentMutation, { loading: creatingShipment }] = useMutation(ADMIN_CREATE_SHIPMENT);
  const [updateShipmentStatusMutation, { loading: updatingStatus }] = useMutation(ADMIN_UPDATE_SHIPMENT_STATUS);
  const [cancelShipmentMutation] = useMutation(ADMIN_CANCEL_SHIPMENT);
  const [addTrackingEventMutation] = useMutation(ADMIN_ADD_TRACKING_EVENT);

  // Shipment Creation Form Modal
  const [createShipmentModalOpen, setCreateShipmentModalOpen] = useState(false);
  const [newShipmentForm, setNewShipmentForm] = useState({
    orderId: '',
    provider: 'INTERNAL_COURIER',
    weightKg: 0.5,
    lengthCm: 20,
    widthCm: 15,
    heightCm: 10,
    packageType: 'Box',
    notes: '',
  });

  // Shipment Status Update Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    nextStatus: '',
    location: '',
    description: '',
  });

  // Tracking Timeline Details Modal
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  // ===================== SHIPPING METHOD DATA =====================
  const {
    data: shippingData,
    loading: shippingLoading,
    refetch: refetchShipping
  } = useQuery(ADMIN_GET_ALL_SHIPPING_METHODS, { fetchPolicy: 'network-only' });

  const [createShippingMethod, { loading: creatingShipping }] = useMutation(ADMIN_CREATE_SHIPPING_METHOD);
  const [updateShippingMethod, { loading: updatingShipping }] = useMutation(ADMIN_UPDATE_SHIPPING_METHOD);
  const [toggleShippingActive] = useMutation(ADMIN_TOGGLE_SHIPPING_METHOD_ACTIVE);

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

  // ===================== TAX RULE DATA =====================
  const {
    data: taxData,
    loading: taxLoading,
    refetch: refetchTax
  } = useQuery(GET_TAX_RULES, { fetchPolicy: 'network-only' });

  const [createTaxRule, { loading: creatingTax }] = useMutation(ADMIN_CREATE_TAX_RULE);
  const [updateTaxRule, { loading: updatingTax }] = useMutation(ADMIN_UPDATE_TAX_RULE);
  const [toggleTaxActive] = useMutation(ADMIN_TOGGLE_TAX_RULE_ACTIVE);

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

  // ===================== HANDLERS: FULFILLMENT =====================
  const handleOpenCreateShipment = () => {
    setNewShipmentForm({
      orderId: '',
      provider: 'INTERNAL_COURIER',
      weightKg: 0.5,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 10,
      packageType: 'Box',
      notes: '',
    });
    setCreateShipmentModalOpen(true);
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    if (!newShipmentForm.orderId.trim()) {
      addToast('Please enter a valid Order ID.', 'error');
      return;
    }

    try {
      const idempotencyKey = 'shp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const input = {
        orderId: newShipmentForm.orderId.trim(),
        provider: newShipmentForm.provider,
        packageDetails: {
          weightKg: parseFloat(newShipmentForm.weightKg) || 0.5,
          lengthCm: parseFloat(newShipmentForm.lengthCm) || 20,
          widthCm: parseFloat(newShipmentForm.widthCm) || 15,
          heightCm: parseFloat(newShipmentForm.heightCm) || 10,
          packageType: newShipmentForm.packageType,
        },
        notes: newShipmentForm.notes.trim() || undefined,
        idempotencyKey,
      };

      const res = await createShipmentMutation({ variables: { input } });
      const created = res.data?.adminCreateShipment;
      addToast(`Shipment created successfully! AWB: ${created?.awbNumber || 'Assigned'}`, 'success');
      setCreateShipmentModalOpen(false);
      refetchShipments();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to create shipment.', 'error');
    }
  };

  const handleOpenStatusModal = (shipment) => {
    setSelectedShipment(shipment);
    setStatusUpdateForm({
      nextStatus: '',
      location: 'Central Sorting Hub',
      description: '',
    });
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusUpdateForm.nextStatus) {
      addToast('Please select a target status.', 'error');
      return;
    }

    try {
      await updateShipmentStatusMutation({
        variables: {
          input: {
            shipmentId: selectedShipment.id,
            nextStatus: statusUpdateForm.nextStatus,
            location: statusUpdateForm.location.trim() || undefined,
            description: statusUpdateForm.description.trim() || undefined,
          },
        },
      });
      addToast(`Shipment status updated to ${statusUpdateForm.nextStatus}.`, 'success');
      setStatusModalOpen(false);
      refetchShipments();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to update status.', 'error');
    }
  };

  const handleCancelShipment = async (shipment) => {
    if (!window.confirm(`Are you sure you want to cancel shipment ${shipment.awbNumber || shipment.id}?`)) {
      return;
    }
    try {
      await cancelShipmentMutation({
        variables: { shipmentId: shipment.id, reason: 'Cancelled by administrator' },
      });
      addToast('Shipment cancelled.', 'info');
      refetchShipments();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to cancel shipment.', 'error');
    }
  };

  const handleOpenTrackingModal = (shipment) => {
    setSelectedShipment(shipment);
    setTrackingModalOpen(true);
  };

  // ===================== HANDLERS: SHIPPING METHODS & TAX =====================
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
        await updateShippingMethod({ variables: { id: editingShippingId, input } });
        addToast('Shipping method updated successfully.', 'success');
      } else {
        await createShippingMethod({ variables: { input } });
        addToast('Shipping method created successfully.', 'success');
      }

      setShippingModalOpen(false);
      refetchShipping();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to save shipping method.', 'error');
    }
  };

  const handleToggleShipping = async (id) => {
    try {
      await toggleShippingActive({ variables: { id } });
      addToast('Shipping status updated.', 'info');
      refetchShipping();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to toggle status.', 'error');
    }
  };

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
        await updateTaxRule({ variables: { id: editingTaxId, input } });
        addToast('Tax rule updated successfully.', 'success');
      } else {
        await createTaxRule({ variables: { input } });
        addToast('Tax rule created successfully.', 'success');
      }

      setTaxModalOpen(false);
      refetchTax();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to save tax rule.', 'error');
    }
  };

  const handleToggleTax = async (id) => {
    try {
      await toggleTaxActive({ variables: { id } });
      addToast('Tax status updated.', 'info');
      refetchTax();
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to toggle status.', 'error');
    }
  };

  const shipments = shipmentsData?.adminGetAllShipments || [];
  const shippingMethods = shippingData?.adminGetAllShippingMethods || [];
  const taxRules = taxData?.getTaxRules || [];

  return (
    <div className="space-y-6">
      <SEO title="Fulfillment & Logistics | Zoberry Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fulfillment & Logistics</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage provider-independent shipments, AWB tracking, delivery methods, and GST tax rules.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('fulfillment')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'fulfillment'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiPackage size={14} /> Shipments ({shipments.length})
          </button>
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

      {/* ===================== TAB 1: FULFILLMENT & SHIPMENTS ===================== */}
      {activeTab === 'fulfillment' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <select
                value={shipmentFilterStatus}
                onChange={(e) => setShipmentFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded text-xs outline-none focus:border-primary"
              >
                <option value="">All Shipment Statuses</option>
                <option value="SHIPMENT_CREATED">Shipment Created</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <button
              onClick={handleOpenCreateShipment}
              className="btn-primary py-2 px-3 text-xs inline-flex items-center gap-1.5"
            >
              <FiPlus size={14} /> Create Shipment for Order
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">AWB / Tracking</th>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Carrier / Provider</th>
                    <th className="py-3 px-4">Recipient Destination</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shipmentsLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        Loading shipments...
                      </td>
                    </tr>
                  ) : shipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No shipments found. Click "Create Shipment for Order" to dispatch paid orders.
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shipment) => {
                      const addr = shipment.shippingAddressSnapshot || {};
                      const isTerminal = shipment.status === 'DELIVERED' || shipment.status === 'CANCELLED';

                      return (
                        <tr key={shipment.id} className="hover:bg-gray-50/50">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                            <div>{shipment.awbNumber || 'Pending AWB'}</div>
                            <span className="text-[10px] text-gray-400 block font-sans">
                              Method: {shipment.shippingMethodCode || 'STANDARD'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-700">
                            {shipment.orderId.substring(0, 8)}...
                          </td>
                          <td className="py-3.5 px-4 text-gray-800 font-medium">
                            {shipment.provider}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            <div className="font-semibold text-gray-800">{addr.fullName || 'Customer'}</div>
                            <div className="text-[11px] text-gray-400 truncate max-w-xs">
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              shipment.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : shipment.status === 'IN_TRANSIT' || shipment.status === 'PICKED_UP' || shipment.status === 'OUT_FOR_DELIVERY'
                                ? 'bg-blue-100 text-primary'
                                : shipment.status === 'CANCELLED' || shipment.status === 'FAILED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {shipment.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">
                            {new Date(shipment.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              onClick={() => handleOpenTrackingModal(shipment)}
                              className="text-primary hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                              title="View tracking history"
                            >
                              <FiActivity size={14} />
                            </button>
                            {!isTerminal && (
                              <button
                                onClick={() => handleOpenStatusModal(shipment)}
                                className="text-gray-700 hover:text-gray-900 p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Update status"
                              >
                                <FiEdit2 size={14} />
                              </button>
                            )}
                            {!isTerminal && (
                              <button
                                onClick={() => handleCancelShipment(shipment)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Cancel shipment"
                              >
                                <FiXCircle size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: SHIPPING METHODS ===================== */}
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
                      <td colSpan={7} className="text-center py-8 text-gray-400">Loading shipping methods...</td>
                    </tr>
                  ) : shippingMethods.map((method) => (
                    <tr key={method.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div>{method.name}</div>
                        <span className="text-[10px] font-mono text-gray-400 block uppercase">{method.code}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">Rs. {method.price}</td>
                      <td className="py-3.5 px-4">
                        {method.freeThreshold !== null && method.freeThreshold !== undefined ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Free on Rs. {method.freeThreshold}+
                          </span>
                        ) : (
                          <span className="text-gray-400">No Free Tier</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{method.estimatedDays || 'Standard Transit'}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">{method.priority}</td>
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
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: TAX RULES ===================== */}
      {activeTab === 'tax' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Configurable Tax Rules (GST)</h2>
              <p className="text-xs text-gray-500">Standard GST rate applied to consumer pricing.</p>
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
                      <td colSpan={6} className="text-center py-8 text-gray-400">Loading tax rules...</td>
                    </tr>
                  ) : taxRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{rule.name}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">{rule.ratePercent}%</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rule.isInclusive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {rule.isInclusive ? 'Tax-Inclusive (Consumer Price)' : 'Tax-Exclusive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{rule.country || 'IN'} {rule.state ? `(${rule.state})` : '(All States)'}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleTax(rule.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1 ${
                            rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
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
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE SHIPMENT ===================== */}
      {createShipmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FiPackage className="text-primary" /> Create Shipment for Order
              </h3>
              <button onClick={() => setCreateShipmentModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Order ID * (Must be PAID order)
                </label>
                <input
                  type="text"
                  required
                  value={newShipmentForm.orderId}
                  onChange={(e) => setNewShipmentForm({ ...newShipmentForm, orderId: e.target.value })}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full px-3 py-2 border border-gray-200 rounded font-mono outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Logistics Carrier Provider *
                </label>
                <select
                  value={newShipmentForm.provider}
                  onChange={(e) => setNewShipmentForm({ ...newShipmentForm, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                >
                  <option value="INTERNAL_COURIER">Internal Express Courier</option>
                  <option value="DELHIVERY_MOCK">Delhivery Provider</option>
                  <option value="SHIPROCKET_MOCK">Shiprocket Provider</option>
                  <option value="BLUE_DART_MOCK">Blue Dart Provider</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newShipmentForm.weightKg}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, weightKg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Package Type</label>
                  <input
                    type="text"
                    value={newShipmentForm.packageType}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, packageType: e.target.value })}
                    placeholder="Box / Bag"
                    className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Length (cm)</label>
                  <input
                    type="number"
                    value={newShipmentForm.lengthCm}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, lengthCm: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Width (cm)</label>
                  <input
                    type="number"
                    value={newShipmentForm.widthCm}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, widthCm: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={newShipmentForm.heightCm}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, heightCm: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Dispatch Notes</label>
                <textarea
                  rows={2}
                  value={newShipmentForm.notes}
                  onChange={(e) => setNewShipmentForm({ ...newShipmentForm, notes: e.target.value })}
                  placeholder="e.g. Fragile contents, priority ground dispatch"
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateShipmentModalOpen(false)}
                  className="btn-outline py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingShipment}
                  className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                >
                  <FiSave size={13} /> {creatingShipment ? 'Booking...' : 'Book Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: UPDATE SHIPMENT STATUS ===================== */}
      {statusModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FiActivity className="text-primary" /> Update Shipment Status ({selectedShipment.awbNumber})
              </h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-600">
                Current Status: <strong className="text-gray-900 uppercase">{selectedShipment.status}</strong>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Next Status *</label>
                <select
                  required
                  value={statusUpdateForm.nextStatus}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, nextStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary uppercase font-bold text-gray-800"
                >
                  <option value="">Select Next Milestone</option>
                  <option value="PICKED_UP">PICKED UP (Carrier collected parcel)</option>
                  <option value="IN_TRANSIT">IN TRANSIT (Package moving between sorting hubs)</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (With local courier driver)</option>
                  <option value="DELIVERED">DELIVERED (Successfully handed to recipient)</option>
                  <option value="FAILED">FAILED (Delivery attempt unsuccessful)</option>
                  <option value="CANCELLED">CANCELLED (Shipment voided)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Hub Location</label>
                <input
                  type="text"
                  value={statusUpdateForm.location}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, location: e.target.value })}
                  placeholder="e.g. Mumbai Sorting Center"
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={statusUpdateForm.description}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, description: e.target.value })}
                  placeholder="e.g. Package arrived at local delivery hub"
                  className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="btn-outline py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                >
                  <FiSave size={13} /> {updatingStatus ? 'Updating...' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: VIEW TRACKING TIMELINE ===================== */}
      {trackingModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FiNavigation className="text-primary" /> Tracking History ({selectedShipment.awbNumber})
              </h3>
              <button onClick={() => setTrackingModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <FiX size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Provider</span>
                  <span className="font-bold text-gray-900">{selectedShipment.provider}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Current Status</span>
                  <span className="font-bold text-primary uppercase">{selectedShipment.status}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Audit Event Log</h4>
                {selectedShipment.trackingEvents && selectedShipment.trackingEvents.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-primary/30 space-y-4">
                    {selectedShipment.trackingEvents.map((ev) => (
                      <div key={ev.id} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-blue-50"></div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 uppercase">{ev.status}</span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(ev.eventTime).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-0.5">{ev.description}</p>
                        {ev.location && <span className="text-[11px] text-gray-400 block mt-0.5">Location: {ev.location}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No tracking events recorded yet.</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="btn-outline py-1.5 px-4 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipping;
