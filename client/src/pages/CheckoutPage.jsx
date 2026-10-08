import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  FiCheckCircle, FiAlertCircle, FiLock, FiTruck, FiMapPin,
  FiShoppingBag, FiArrowRight, FiUser, FiCreditCard
} from 'react-icons/fi';
import { PREVIEW_CHECKOUT, CREATE_ORDER_FROM_CART } from '../graphql/orders';
import { GET_MY_ADDRESSES } from '../graphql/address';
import { getGuestSessionToken, clearGuestSessionToken } from '../utils/guestToken';
import { useUIStore } from '../store/uiStore';
import SEO from '../components/common/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const guestSessionToken = getGuestSessionToken();
  const { user, openAuthModal, addToast, setCartCount } = useUIStore();

  // Guest Address State
  const [guestAddress, setGuestAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
  });

  // Selected Address for Authenticated User
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. Fetch server-authoritative checkout preview
  const {
    data: previewData,
    loading: previewLoading,
    error: previewError,
    refetch: refetchPreview,
  } = useQuery(PREVIEW_CHECKOUT, {
    variables: { guestSessionToken },
    fetchPolicy: 'network-only',
  });

  // 2. Fetch authenticated customer addresses if logged in
  const { data: addressData } = useQuery(GET_MY_ADDRESSES, {
    skip: !user,
  });

  const addresses = addressData?.getMyAddresses || [];

  // Auto-select default shipping address if logged in
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefaultShipping) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const preview = previewData?.previewCheckout;
  const items = preview?.items || [];
  const validationErrors = preview?.validationErrors || [];
  const isReady = preview?.isReadyForCheckout && validationErrors.length === 0;

  // 3. Create Order Mutation
  const [createOrderMutation] = useMutation(CREATE_ORDER_FROM_CART);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!items || items.length === 0) {
      setFormError('Your cart is empty. Add items before checking out.');
      return;
    }

    if (!isReady) {
      setFormError('Some items in your cart are no longer available. Please review your cart.');
      return;
    }

    // Validate Address
    if (user) {
      if (!selectedAddressId) {
        setFormError('Please select a shipping address.');
        return;
      }
    } else {
      if (
        !guestAddress.fullName.trim() ||
        !guestAddress.phone.trim() ||
        !guestAddress.email.trim() ||
        !guestAddress.addressLine1.trim() ||
        !guestAddress.city.trim() ||
        !guestAddress.state.trim() ||
        !guestAddress.postalCode.trim()
      ) {
        setFormError('Please fill in all required shipping address fields.');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Generate unique idempotency key for this order submission attempt
      const idempotencyKey = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

      const input = {
        idempotencyKey,
        notes: orderNotes.trim() || undefined,
        guestSessionToken: user ? undefined : guestSessionToken,
      };

      if (user) {
        input.shippingAddressId = selectedAddressId;
      } else {
        input.guestEmail = guestAddress.email.trim();
        input.guestPhone = guestAddress.phone.trim();
        input.guestShippingAddress = {
          fullName: guestAddress.fullName.trim(),
          phone: guestAddress.phone.trim(),
          addressLine1: guestAddress.addressLine1.trim(),
          addressLine2: guestAddress.addressLine2?.trim() || undefined,
          landmark: guestAddress.landmark?.trim() || undefined,
          city: guestAddress.city.trim(),
          state: guestAddress.state.trim(),
          postalCode: guestAddress.postalCode.trim(),
          country: guestAddress.country || 'IN',
        };
      }

      const res = await createOrderMutation({
        variables: { input },
      });

      const order = res.data?.createOrderFromCart;

      if (order?.orderNumber) {
        setCartCount(0);
        addToast(`Order placed successfully! Order #${order.orderNumber}`, 'success');
        navigate(`/order/${order.orderNumber}`);
      }
    } catch (err) {
      setFormError(err.message?.replace('GraphQL error: ', '') || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (previewLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium text-sm">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded border border-gray-200 shadow-xs">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm mb-6">
            There are no items ready for checkout. Add items to your cart first.
          </p>
          <Link to="/products" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <SEO
        title="Secure Checkout | Zoberry Enterprise"
        description="Complete your order securely with Zoberry Enterprise."
        url="/checkout"
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary tracking-tight">
              Checkout
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Complete your purchase details</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
            <FiLock size={13} />
            <span>Secure 256-bit Encrypted Checkout</span>
          </div>
        </div>

        {/* Validation Errors Notice */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-xs text-red-700 space-y-1">
            <div className="font-bold flex items-center gap-2">
              <FiAlertCircle size={15} /> Attention required before placing order:
            </div>
            {validationErrors.map((err, i) => (
              <div key={i} className="pl-6">• {err}</div>
            ))}
          </div>
        )}

        {formError && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded text-xs font-semibold text-red-700 flex items-center gap-2">
            <FiAlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Information & Delivery Address (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Customer Account Check */}
            {!user ? (
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Account</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Already have an account with saved addresses?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="btn-outline py-2 px-3 text-xs"
                  >
                    Log In
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-primary font-bold flex items-center justify-center">
                    <FiUser size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">{user.email}</span>
                    <span className="text-gray-400 block text-[11px]">Logged in customer</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiMapPin className="text-primary" /> Delivery Shipping Address
              </h2>

              {user ? (
                // Authenticated Address Selector
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500 mb-3">No saved addresses found.</p>
                      <Link to="/account?tab=addresses" className="btn-outline py-2 text-xs inline-flex">
                        Add an address in your account
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-primary bg-blue-50/30 ring-1 ring-primary/20'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-primary"
                          />
                          <div className="text-xs">
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {addr.fullName} • {addr.phone}
                              {addr.isDefaultShipping && (
                                <span className="text-[10px] bg-blue-100 text-primary px-1.5 py-0.2 rounded uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-gray-600 mt-1 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                              {addr.landmark ? `, Landmark: ${addr.landmark}` : ''},{' '}
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </div>
                          </div>
                        </label>
                      ))}
                      <div className="pt-2">
                        <Link
                          to="/account?tab=addresses"
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          + Manage or add new addresses
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Guest Address Form
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestAddress.fullName}
                        onChange={(e) => setGuestAddress({ ...guestAddress, fullName: e.target.value })}
                        placeholder="Recipient's Name"
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
                        value={guestAddress.phone}
                        onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                        placeholder="10-digit mobile"
                        className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Email Address (for order updates) *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestAddress.email}
                      onChange={(e) => setGuestAddress({ ...guestAddress, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Street Address / House No *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestAddress.addressLine1}
                      onChange={(e) => setGuestAddress({ ...guestAddress, addressLine1: e.target.value })}
                      placeholder="House / Flat / Building No., Street"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Area / Sector (Optional)
                      </label>
                      <input
                        type="text"
                        value={guestAddress.addressLine2}
                        onChange={(e) => setGuestAddress({ ...guestAddress, addressLine2: e.target.value })}
                        placeholder="Area details"
                        className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={guestAddress.landmark}
                        onChange={(e) => setGuestAddress({ ...guestAddress, landmark: e.target.value })}
                        placeholder="e.g. Near Metro Station"
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
                        value={guestAddress.city}
                        onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
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
                        value={guestAddress.state}
                        onChange={(e) => setGuestAddress({ ...guestAddress, state: e.target.value })}
                        placeholder="State"
                        className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestAddress.postalCode}
                        onChange={(e) => setGuestAddress({ ...guestAddress, postalCode: e.target.value })}
                        placeholder="6-digit"
                        className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiCreditCard className="text-primary" /> Payment Method
              </h2>
              
              <div className="p-4 rounded border border-primary bg-blue-50/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    defaultChecked
                    className="accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Direct Standard Order / Cash On Delivery
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      Pay securely when the courier arrives at your door.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Available
                </span>
              </div>
            </div>

            {/* Step 4: Optional Order Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Order Notes / Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Please leave package at reception or call before delivery"
                className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Right: Server Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-4 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 uppercase tracking-wide">
                Order Items ({preview?.itemCount || 0})
              </h2>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const img = item.product?.images?.[0];
                  const imageUrl = img
                    ? (img.startsWith('http') ? img : `${API_URL}${img}`)
                    : 'https://placehold.co/80x80?text=Item';

                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 bg-gray-50 rounded border border-gray-100 overflow-hidden shrink-0">
                          <img src={imageUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                          <span className="absolute top-0 right-0 bg-gray-700 text-white text-[9px] font-bold px-1 rounded-bl">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{item.product?.name}</h4>
                          {item.variant && (
                            <span className="text-[11px] text-gray-500 block">Option: {item.variant.title}</span>
                          )}
                          <span className="text-gray-400 text-[11px]">Rs. {item.unitPrice} each</span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0">
                        Rs. {item.lineTotal.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Server-authoritative Totals */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rs. {preview?.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">
                    {preview?.shippingAmount === 0 ? 'FREE' : `Rs. ${preview?.shippingAmount}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="text-gray-500">
                    {preview?.taxAmount === 0 ? 'Included' : `Rs. ${preview?.taxAmount}`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Grand Total</span>
                  <span className="text-xl font-extrabold text-secondary">
                    Rs. {preview?.grandTotal?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting || !isReady}
                className="btn-primary w-full py-4 text-xs tracking-wider"
              >
                {submitting ? 'Placing Order...' : 'Confirm & Place Order'} <FiArrowRight size={14} />
              </button>

              <div className="text-center text-[11px] text-gray-400">
                By placing this order, you agree to Zoberry's terms of service and shipping policies.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
