import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  FiCheckCircle, FiPackage, FiTruck, FiMapPin,
  FiClock, FiArrowRight, FiShoppingBag, FiCreditCard, FiAlertTriangle, FiRefreshCw, FiTag, FiNavigation
} from 'react-icons/fi';
import { GET_ORDER_BY_NUMBER } from '../graphql/orders';
import { GET_PAYMENT_STATUS, INITIATE_PAYMENT } from '../graphql/payment';
import { useUIStore } from '../store/uiStore';
import SEO from '../components/common/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const paymentParam = searchParams.get('payment');
  const { addToast } = useUIStore();
  const [retrying, setRetrying] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_ORDER_BY_NUMBER, {
    variables: { orderNumber },
    skip: !orderNumber,
    fetchPolicy: 'network-only',
  });

  const { data: paymentData, loading: paymentLoading } = useQuery(GET_PAYMENT_STATUS, {
    variables: { orderNumber },
    skip: !orderNumber,
    fetchPolicy: 'network-only',
  });

  const [initiatePaymentMutation] = useMutation(INITIATE_PAYMENT);

  const handleRetryPayment = async () => {
    if (!orderNumber) return;
    setRetrying(true);
    try {
      addToast('Initiating PhonePe payment attempt...', 'info');
      const res = await initiatePaymentMutation({
        variables: { orderNumber },
      });
      const redirectUrl = res.data?.initiatePayment?.redirectUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        addToast('Payment gateway redirect URL not found. Please try again.', 'error');
      }
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to retry payment.', 'error');
    } finally {
      setRetrying(false);
    }
  };

  const order = data?.getOrderByNumber;
  const paymentInfo = paymentData?.getPaymentStatus;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">
            We couldn't find an order with number <span className="font-semibold">{orderNumber}</span>.
          </p>
          <Link to="/" className="btn-primary inline-flex">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const shipping = order.shippingAddressSnapshot || {};
  const shippingSnapshot = order.shippingSnapshot || {};
  const taxSnapshot = order.taxSnapshot || {};
  const shipments = order.shipments || [];
  const primaryShipment = shipments[0] || null;

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const isPaid = order.paymentStatus === 'PAID' || paymentInfo?.paymentStatus === 'SUCCESS';
  const isFailed = order.paymentStatus === 'FAILED' || paymentInfo?.paymentStatus === 'FAILED';

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <SEO
        title={`Order #${order.orderNumber} | Zoberry Enterprise`}
        description={`Details and tracking status for order #${order.orderNumber}.`}
        url={`/order/${order.orderNumber}`}
      />

      <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-6">
        {/* Payment Failure Warning Banner */}
        {isFailed && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <FiAlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-900">Payment Unsuccessful</h3>
                <p className="text-xs text-red-700 mt-1">
                  Your payment attempt for Order #{order.orderNumber} could not be completed. Your order is reserved, and you can retry payment now.
                </p>
              </div>
            </div>
            <button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2 shrink-0 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FiRefreshCw className={retrying ? 'animate-spin' : ''} size={14} />
              {retrying ? 'Initiating...' : 'Retry Payment with PhonePe'}
            </button>
          </div>
        )}

        {/* Success Banner */}
        {isPaid ? (
          <div className="bg-white rounded-xl border border-emerald-200 p-6 md:p-8 text-center shadow-xs">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={36} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded">
              Order Confirmed & Payment Verified
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary mt-3 mb-2">
              Thank you for your purchase!
            </h1>
            <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto">
              Your order number is <span className="font-bold text-gray-900">{order.orderNumber}</span>. We've verified your payment and our logistics team is processing your fulfillment.
            </p>
          </div>
        ) : !isFailed ? (
          <div className="bg-white rounded-xl border border-blue-200 p-6 md:p-8 text-center shadow-xs">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={36} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded">
              Order Received
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary mt-3 mb-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto">
              Your order has been recorded in our system and is currently pending fulfillment.
            </p>
          </div>
        ) : null}

        {/* Order Info & Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Order Status</span>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              <span className="font-bold text-sm text-gray-900 uppercase">{order.status}</span>
            </div>
            <span className="text-[11px] text-gray-400 mt-2 block">{dateStr}</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Payment Status</span>
            <div className="flex items-center gap-2">
              <FiCreditCard size={15} className={isPaid ? 'text-emerald-600' : isFailed ? 'text-red-500' : 'text-primary'} />
              <span className={`font-bold text-sm uppercase ${isPaid ? 'text-emerald-600' : isFailed ? 'text-red-600' : 'text-gray-900'}`}>
                {isPaid ? 'PAID' : isFailed ? 'FAILED' : order.paymentStatus}
              </span>
            </div>
            <span className="text-[11px] text-gray-500 mt-2 block">
              {paymentInfo?.providerPaymentId ? `PhonePe Ref: ${paymentInfo.providerPaymentId}` : 'Standard / Online Payment'}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Fulfillment & Shipment</span>
            <div className="flex items-center gap-2">
              <FiTruck size={15} className="text-primary" />
              <span className="font-bold text-sm text-gray-900 uppercase">
                {primaryShipment?.status || order.fulfillmentStatus || 'UNFULFILLED'}
              </span>
            </div>
            <span className="text-[11px] text-gray-500 mt-2 block">
              {primaryShipment?.awbNumber ? `AWB: ${primaryShipment.awbNumber}` : 'Awaiting carrier dispatch'}
            </span>
          </div>
        </div>

        {/* Shipment & Live Tracking Section (Phase 7) */}
        {primaryShipment ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FiNavigation className="text-primary" /> Tracking & Logistics Information
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Carrier: <strong className="text-gray-800">{primaryShipment.provider}</strong> • Method: <strong className="text-gray-800">{primaryShipment.shippingMethodCode || order.shippingMethod}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-800 px-3 py-1 rounded border border-gray-200 block sm:inline-block">
                  AWB: {primaryShipment.awbNumber || 'Assigned'}
                </span>
                {primaryShipment.estimatedDeliveryAt && (
                  <span className="text-[11px] text-gray-500 block mt-1">
                    Est. Delivery: {new Date(primaryShipment.estimatedDeliveryAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Tracking Milestones Timeline */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tracking Updates</h3>
              {primaryShipment.trackingEvents && primaryShipment.trackingEvents.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-primary/30 space-y-4 text-xs">
                  {primaryShipment.trackingEvents.map((ev, idx) => (
                    <div key={ev.id || idx} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-blue-50"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-gray-900 uppercase">{ev.status}</span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(ev.eventTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{ev.description || ev.status}</p>
                      {ev.location && <span className="text-[11px] text-gray-400 block mt-0.5">Location: {ev.location}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Shipment is created. Carrier tracking events will update shortly.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-primary flex items-center justify-center shrink-0">
                <FiPackage size={18} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">Shipment in Preparation</h4>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Your order is confirmed and queued for fulfillment dispatch. An AWB tracking number will be assigned once packaged.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden mb-8">
          <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Items in this order ({order.items?.length || 0})
            </h2>
          </div>

          {/* Items */}
          <div className="p-5 divide-y divide-gray-100">
            {order.items?.map((item) => {
              const img = item.productImage;
              const imageUrl = img
                ? (img.startsWith('http') ? img : `${API_URL}${img}`)
                : 'https://placehold.co/80x80?text=Item';

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={imageUrl}
                      alt={item.productName}
                      className="w-14 h-14 rounded border border-gray-100 object-cover bg-gray-50 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{item.productName}</h4>
                      {item.variantTitle && (
                        <span className="text-xs text-gray-500 block">Option: {item.variantTitle}</span>
                      )}
                      <span className="text-xs text-gray-400">Qty: {item.quantity} × Rs. {item.unitPrice}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-gray-900">
                      Rs. {item.lineTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breakdown & Shipping */}
          <div className="p-5 bg-gray-50 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Shipping Address Snapshot */}
            <div>
              <h3 className="font-bold text-gray-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <FiMapPin className="text-primary" /> Delivery Address
              </h3>
              <div className="text-gray-600 space-y-0.5 leading-relaxed bg-white p-3 rounded border border-gray-200">
                <div className="font-bold text-gray-900">{shipping.fullName}</div>
                <div>{shipping.phone}</div>
                <div>{shipping.addressLine1}</div>
                {shipping.addressLine2 && <div>{shipping.addressLine2}</div>}
                {shipping.landmark && <div>Landmark: {shipping.landmark}</div>}
                <div>
                  {shipping.city}, {shipping.state} - {shipping.postalCode}
                </div>
                <div className="text-gray-400">{shipping.country || 'IN'}</div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 uppercase tracking-wide mb-2">
                Payment Summary
              </h3>
              <div className="bg-white p-3 rounded border border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rs. {order.subtotal.toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <FiTag size={12} /> Coupon Discount ({order.couponCode || 'APPLIED'})
                    </span>
                    <span>- Rs. {order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping ({shippingSnapshot.name || order.shippingMethod || 'Standard'})</span>
                  <span className="font-semibold text-emerald-600">
                    {order.shippingAmount === 0 ? 'FREE' : `Rs. ${order.shippingAmount}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (Included)</span>
                  <span className="text-gray-500">
                    {taxSnapshot.ratePercent ? `${taxSnapshot.ratePercent}% (Rs. ${order.taxAmount})` : 'Included'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-sm">Total Paid/Due</span>
                  <span className="font-extrabold text-secondary text-base">
                    Rs. {order.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/products" className="btn-primary text-xs">
            <FiShoppingBag size={14} /> Continue Shopping
          </Link>
          <Link to="/account?tab=orders" className="btn-outline text-xs">
            View All Your Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
