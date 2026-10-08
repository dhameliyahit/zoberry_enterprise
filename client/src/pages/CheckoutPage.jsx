import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  FiShield, FiAlertCircle, FiLock, FiTruck, FiMapPin,
  FiShoppingBag, FiArrowRight, FiUser, FiCreditCard, FiTag, FiX,
  FiCheckCircle, FiChevronRight, FiHelpCircle
} from 'react-icons/fi';
import { PREVIEW_CHECKOUT, CREATE_ORDER_FROM_CART } from '../graphql/orders';
import { VALIDATE_COUPON } from '../graphql/promotions';
import { INITIATE_PAYMENT } from '../graphql/payment';
import { GET_MY_ADDRESSES } from '../graphql/address';
import { getGuestSessionToken } from '../utils/guestToken';
import { useUIStore } from '../store/uiStore';
import SEO from '../components/common/SEO';
import { Button, Input, Card, CardBody, CardHeader, Badge } from '../components/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const guestSessionToken = getGuestSessionToken();
  const { user, openAuthModal, addToast, setCartCount } = useUIStore();

  // Payment Method Selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('PHONEPE');

  // Shipping Method Selection
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('STANDARD');

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

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  // 1. Fetch server-authoritative checkout preview with couponCode & shippingMethodCode
  const {
    data: previewData,
    loading: previewLoading,
    error: previewError,
  } = useQuery(PREVIEW_CHECKOUT, {
    variables: {
      guestSessionToken,
      couponCode: appliedCouponCode || undefined,
      shippingMethodCode: selectedShippingMethod,
      shippingAddressId: user && selectedAddressId ? selectedAddressId : undefined,
      postalCode: !user && guestAddress.postalCode ? guestAddress.postalCode : undefined,
    },
    fetchPolicy: 'network-only',
  });

  const [validateCouponQuery, { loading: couponValidating }] = useLazyQuery(VALIDATE_COUPON, {
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
  const availableShippingMethods = preview?.availableShippingMethods || [
    {
      code: 'STANDARD',
      name: 'Standard Delivery',
      description: 'Safe and reliable ground shipping to your doorstep',
      actualPrice: 99.00,
      isFree: false,
      estimatedDays: '3 - 5 business days',
    },
    {
      code: 'EXPRESS',
      name: 'Express Priority Delivery',
      description: 'Expedited courier priority dispatch',
      actualPrice: 199.00,
      isFree: false,
      estimatedDays: '1 - 2 business days',
    },
  ];
  const isReady = preview?.isReadyForCheckout && validationErrors.length === 0;

  // 3. Order & Payment Mutations
  const [createOrderMutation] = useMutation(CREATE_ORDER_FROM_CART);
  const [initiatePaymentMutation] = useMutation(INITIATE_PAYMENT);

  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponError('');
    try {
      const res = await validateCouponQuery({
        variables: {
          code: couponInput.trim(),
          guestSessionToken: user ? undefined : guestSessionToken,
        },
      });
      const data = res.data?.validateCoupon;
      if (data?.isValid) {
        setAppliedCouponCode(data.code);
        addToast(`Coupon "${data.code}" applied: Saved ₹${data.discountAmount}!`, 'success');
      } else {
        setCouponError(data?.message || 'Invalid or ineligible coupon code.');
      }
    } catch (err) {
      setCouponError(err.message?.replace('GraphQL error: ', '') || 'Failed to validate coupon.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode('');
    setCouponInput('');
    setCouponError('');
    addToast('Coupon removed.', 'info');
  };

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
        couponCode: appliedCouponCode || undefined,
        shippingMethodCode: selectedShippingMethod,
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

        if (selectedPaymentMethod === 'PHONEPE') {
          addToast(`Order #${order.orderNumber} created. Redirecting to PhonePe...`, 'info');
          try {
            const payRes = await initiatePaymentMutation({
              variables: { orderNumber: order.orderNumber },
            });
            const redirectUrl = payRes.data?.initiatePayment?.redirectUrl;
            if (redirectUrl) {
              window.location.href = redirectUrl;
              return;
            }
          } catch (payErr) {
            console.error('Payment initiation error:', payErr);
            addToast('Could not redirect to PhonePe. You can complete payment from your order page.', 'warning');
          }
        } else {
          addToast(`Order placed successfully! Order #${order.orderNumber}`, 'success');
        }

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
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm mb-6">
            There are no items ready for checkout. Add items to your cart first.
          </p>
          <Link to="/products">
            <Button variant="primary">Browse Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const eligibleSubtotal = Math.max(0, (preview?.subtotal || 0) - (preview?.discountAmount || 0));
  const freeThreshold = 999;
  const isFreeEligible = eligibleSubtotal >= freeThreshold;
  const neededForFree = freeThreshold - eligibleSubtotal;

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <SEO
        title="Secure Checkout | Zoberry Enterprise"
        description="Complete your order securely with Zoberry Enterprise."
        url="/checkout"
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header Breadcrumb & Trust */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
              <FiChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-semibold">Checkout</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200 self-start sm:self-auto">
            <FiShield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-Bit Encrypted & Verified</span>
          </div>
        </div>

        {/* Free Shipping Alert Banner */}
        {isFreeEligible ? (
          <div className="mb-6 p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2.5">
            <FiCheckCircle className="text-emerald-600 shrink-0 w-4 h-4" />
            <span>🎉 Congratulations! Your order qualifies for <strong>FREE Standard Delivery</strong> (Orders over ₹999).</span>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FiTruck className="text-primary shrink-0 w-4 h-4" />
              <span>Add <strong>₹{neededForFree.toLocaleString()}</strong> more to unlock <strong>FREE Standard Shipping</strong>!</span>
            </div>
            <Link to="/products" className="text-primary font-bold hover:underline shrink-0 text-xs">
              + Add Items
            </Link>
          </div>
        )}

        {/* Validation Errors Notice */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1.5">
            <div className="font-bold flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4" /> Action required before placing order:
            </div>
            {validationErrors.map((err, i) => (
              <div key={i} className="pl-6">• {err}</div>
            ))}
          </div>
        )}

        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2.5">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Information & Delivery Address & Shipping Method (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Customer Account Check */}
            {!user ? (
              <Card>
                <CardBody className="p-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Customer Account</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Already have an account? Sign in for saved addresses and fast checkout.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openAuthModal('login')}
                  >
                    Log In
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardBody className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{user.email}</span>
                      <span className="text-slate-400 block text-[11px]">Logged in customer</span>
                    </div>
                  </div>
                  <Badge variant="blue">Authenticated</Badge>
                </CardBody>
              </Card>
            )}

            {/* Step 2: Shipping Address */}
            <Card>
              <CardHeader className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-primary" /> 1. Shipping Address
                </h2>
                <span className="text-xs text-slate-400">Step 1 of 3</span>
              </CardHeader>
              <CardBody className="p-5">
                {user ? (
                  // Authenticated Address Selector
                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-slate-500 mb-3">No saved addresses found in your account.</p>
                        <Link to="/account?tab=addresses">
                          <Button variant="outline" size="sm">
                            + Add an address
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {addresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 accent-primary"
                            />
                            <div className="text-xs flex-1">
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                {addr.fullName} • {addr.phone}
                                {addr.isDefaultShipping && (
                                  <Badge variant="blue" size="sm">Default</Badge>
                                )}
                              </div>
                              <div className="text-slate-600 mt-1 leading-relaxed">
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
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Input
                        label="Full Name *"
                        required
                        value={guestAddress.fullName}
                        onChange={(e) => setGuestAddress({ ...guestAddress, fullName: e.target.value })}
                        placeholder="Recipient's Name"
                      />
                      <Input
                        label="Phone Number *"
                        type="tel"
                        required
                        value={guestAddress.phone}
                        onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    <Input
                      label="Email Address (for order tracking & invoice) *"
                      type="email"
                      required
                      value={guestAddress.email}
                      onChange={(e) => setGuestAddress({ ...guestAddress, email: e.target.value })}
                      placeholder="name@example.com"
                    />

                    <Input
                      label="Street Address / House No *"
                      required
                      value={guestAddress.addressLine1}
                      onChange={(e) => setGuestAddress({ ...guestAddress, addressLine1: e.target.value })}
                      placeholder="House / Flat / Building No., Street details"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Input
                        label="Area / Sector (Optional)"
                        value={guestAddress.addressLine2}
                        onChange={(e) => setGuestAddress({ ...guestAddress, addressLine2: e.target.value })}
                        placeholder="Area, colony or neighborhood"
                      />
                      <Input
                        label="Landmark (Optional)"
                        value={guestAddress.landmark}
                        onChange={(e) => setGuestAddress({ ...guestAddress, landmark: e.target.value })}
                        placeholder="e.g. Near Metro Station"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3.5">
                      <Input
                        label="City *"
                        required
                        value={guestAddress.city}
                        onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                        placeholder="City"
                      />
                      <Input
                        label="State *"
                        required
                        value={guestAddress.state}
                        onChange={(e) => setGuestAddress({ ...guestAddress, state: e.target.value })}
                        placeholder="State"
                      />
                      <Input
                        label="Pincode *"
                        required
                        value={guestAddress.postalCode}
                        onChange={(e) => setGuestAddress({ ...guestAddress, postalCode: e.target.value })}
                        placeholder="6-digit"
                      />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Step 3: Shipping Method Selection */}
            <Card>
              <CardHeader className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FiTruck className="w-4 h-4 text-primary" /> 2. Delivery Method
                </h2>
                <span className="text-xs text-slate-400">Step 2 of 3</span>
              </CardHeader>
              <CardBody className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {availableShippingMethods.map((method) => {
                    const isSelected = selectedShippingMethod === method.code;
                    return (
                      <label
                        key={method.code}
                        onClick={() => setSelectedShippingMethod(method.code)}
                        className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <input
                                type="radio"
                                name="shippingMethod"
                                checked={isSelected}
                                onChange={() => setSelectedShippingMethod(method.code)}
                                className="accent-primary"
                              />
                              {method.name}
                            </span>
                            {method.isFree ? (
                              <Badge variant="green" size="sm">FREE</Badge>
                            ) : (
                              <span className="text-xs font-bold text-slate-900">
                                ₹{method.actualPrice}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {method.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Est: {method.estimatedDays || 'Standard Ground'}</span>
                          {method.freeThreshold && !method.isFree && (
                            <span className="text-[10px] text-primary font-semibold">Free on ₹{method.freeThreshold}+</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Step 4: Payment Method Selection */}
            <Card>
              <CardHeader className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FiCreditCard className="w-4 h-4 text-primary" /> 3. Payment Method
                </h2>
                <span className="text-xs text-slate-400">Step 3 of 3</span>
              </CardHeader>
              <CardBody className="p-5 space-y-3.5">
                {/* PhonePe Option */}
                <label
                  onClick={() => setSelectedPaymentMethod('PHONEPE')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'PHONEPE'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethod === 'PHONEPE'}
                      onChange={() => setSelectedPaymentMethod('PHONEPE')}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        PhonePe Standard Gateway
                        <Badge variant="blue" size="sm">UPI / Cards / NetBanking</Badge>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Instant, seamless and encrypted checkout via PhonePe.
                      </span>
                    </div>
                  </div>
                  <Badge variant="blue" size="sm">Recommended</Badge>
                </label>

                {/* Cash On Delivery Option */}
                <label
                  onClick={() => setSelectedPaymentMethod('COD')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'COD'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethod === 'COD'}
                      onChange={() => setSelectedPaymentMethod('COD')}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Cash On Delivery (COD)
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Pay securely with cash or UPI when your order is delivered.
                      </span>
                    </div>
                  </div>
                  <Badge variant="gray" size="sm">COD</Badge>
                </label>
              </CardBody>
            </Card>

            {/* Step 5: Optional Order Notes */}
            <Card>
              <CardBody className="p-5">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Order Notes / Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Leave package with guard or call before delivery"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                />
              </CardBody>
            </Card>
          </div>

          {/* Right: Server Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="sticky top-24">
              <CardHeader className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Order Summary ({preview?.itemCount || 0} {preview?.itemCount === 1 ? 'item' : 'items'})
                </h2>
                <Badge variant="gray" size="sm">{items.length} Lines</Badge>
              </CardHeader>
              <CardBody className="p-5 space-y-4">
                {/* Items List */}
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const img = item.product?.images?.[0];
                    const imageUrl = img
                      ? (img.startsWith('http') ? img : `${API_URL}${img}`)
                      : 'https://placehold.co/80x80?text=Item';

                    return (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                            <img src={imageUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                            <span className="absolute top-0 right-0 bg-slate-800 text-white text-[9px] font-bold px-1 rounded-bl">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{item.product?.name}</h4>
                            {item.variant && (
                              <span className="text-[11px] text-slate-500 block">Option: {item.variant.title}</span>
                            )}
                            <span className="text-slate-400 text-[11px]">₹{item.unitPrice} each</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">
                          ₹{item.lineTotal?.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Promo / Coupon Code Section */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                    <FiTag className="w-3.5 h-3.5 text-primary" /> Promo / Coupon Code
                  </label>
                  {appliedCouponCode ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono tracking-wider">{appliedCouponCode}</span>
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          {preview?.discountAmount > 0 ? `(-₹${preview.discountAmount})` : 'Applied'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remove coupon"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            if (couponError) setCouponError('');
                          }}
                          placeholder="e.g. WELCOME10"
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono tracking-wider uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleApplyCoupon}
                          disabled={couponValidating || !couponInput.trim()}
                          loading={couponValidating}
                        >
                          Apply
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-red-500 font-medium">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Server-authoritative Totals */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{preview?.subtotal?.toLocaleString()}</span>
                  </div>
                  {preview?.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <FiTag className="w-3.5 h-3.5" /> Coupon Discount ({preview?.couponCode || appliedCouponCode})
                      </span>
                      <span>- ₹{preview?.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping ({preview?.shippingSnapshot?.name || preview?.shippingMethod || selectedShippingMethod})</span>
                    <span className="font-semibold text-emerald-600">
                      {preview?.shippingAmount === 0 ? 'FREE' : `₹${preview?.shippingAmount}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (Included)</span>
                    <span className="text-slate-500">
                      {preview?.taxSnapshot?.ratePercent ? `${preview.taxSnapshot.ratePercent}% (₹${preview.taxAmount})` : 'Included'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Grand Total</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      ₹{preview?.grandTotal?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={submitting || !isReady}
                  loading={submitting}
                >
                  {selectedPaymentMethod === 'PHONEPE' ? 'Pay & Place Order' : 'Confirm Order'}
                </Button>

                <div className="text-center text-[11px] text-slate-400">
                  By placing this order, you agree to Zoberry's terms of service and shipping policies.
                </div>
              </CardBody>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
