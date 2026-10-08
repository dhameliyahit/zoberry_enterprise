import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  CheckCircle2, Package, Truck, MapPin,
  Clock, ArrowRight, ShoppingBag, CreditCard, AlertTriangle, RefreshCw, Tag, Navigation,
  ExternalLink, Copy, Check
} from 'lucide-react';
import { GET_ORDER_BY_NUMBER } from '../graphql/orders';
import { GET_PAYMENT_STATUS, INITIATE_PAYMENT } from '../graphql/payment';
import { useUIStore } from '../store/uiStore';
import SEO from '../components/common/SEO';
import { Button, Card, CardBody, CardHeader, Badge, StatusBadge } from '../components/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const { addToast } = useUIStore();
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Order number copied to clipboard', 'info');
    }
  };

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
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            We couldn't find an order with number <span className="font-semibold">{orderNumber}</span>.
          </p>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
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
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
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
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-900">Payment Unsuccessful</h3>
                <p className="text-xs text-red-700 mt-1">
                  Your payment attempt for Order #{order.orderNumber} could not be completed. Your order is reserved, and you can retry payment now.
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRetryPayment}
              loading={retrying}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Payment with PhonePe
            </Button>
          </div>
        )}

        {/* Success Banner */}
        {isPaid ? (
          <div className="bg-white rounded-xl border border-emerald-200 p-6 md:p-8 text-center shadow-xs">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <Badge variant="green" className="mb-2">Order Confirmed & Payment Verified</Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 mb-2">
              Thank you for your purchase!
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto">
              Your order number is <strong className="text-slate-900">{order.orderNumber}</strong>. We've verified your payment and our fulfillment team is preparing your shipment.
            </p>
          </div>
        ) : !isFailed ? (
          <div className="bg-white rounded-xl border border-blue-200 p-6 md:p-8 text-center shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <Badge variant="blue" className="mb-2">Order Received</Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 mb-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto">
              Your order has been recorded in our system and is currently pending fulfillment.
            </p>
          </div>
        ) : null}

        {/* Order Info & Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Order Status</span>
              <div className="flex items-center justify-between">
                <StatusBadge status={order.status} type="order" />
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                  title="Copy Order Number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-2.5 block">{dateStr}</span>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Payment Status</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={isPaid ? 'PAID' : isFailed ? 'FAILED' : order.paymentStatus} type="payment" />
              </div>
              <span className="text-[11px] text-slate-500 mt-2.5 block">
                {paymentInfo?.providerPaymentId ? `Ref: ${paymentInfo.providerPaymentId}` : 'Standard / PhonePe Payment'}
              </span>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Fulfillment & Delivery</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={primaryShipment?.status || order.fulfillmentStatus || 'UNFULFILLED'} type="shipment" />
              </div>
              <span className="text-[11px] text-slate-500 mt-2.5 block">
                {primaryShipment?.awbNumber ? `AWB: ${primaryShipment.awbNumber}` : 'Awaiting carrier dispatch'}
              </span>
            </CardBody>
          </Card>
        </div>

        {/* Shipment & Live Tracking Section (Phase 7) */}
        {primaryShipment ? (
          <Card>
            <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" /> Tracking & Logistics Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Carrier: <strong className="text-slate-800">{primaryShipment.provider}</strong> • Method: <strong className="text-slate-800">{primaryShipment.shippingMethodCode || order.shippingMethod}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-md border border-slate-200 inline-block">
                  AWB: {primaryShipment.awbNumber || 'Assigned'}
                </span>
                {primaryShipment.estimatedDeliveryAt && (
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Est. Delivery: {new Date(primaryShipment.estimatedDeliveryAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardBody className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tracking Updates</h3>
              {primaryShipment.trackingEvents && primaryShipment.trackingEvents.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-primary/20 space-y-5 text-xs py-1">
                  {primaryShipment.trackingEvents.map((ev, idx) => (
                    <div key={ev.id || idx} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 uppercase">{ev.status}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ev.eventTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{ev.description || ev.status}</p>
                      {ev.location && <span className="text-[11px] text-slate-400 block mt-0.5">Location: {ev.location}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Shipment is created. Carrier tracking events will update shortly as the parcel progresses.</p>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Shipment in Preparation</h4>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Your order is confirmed and queued for fulfillment dispatch. An AWB tracking number will be assigned once packaged.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Container */}
        <Card>
          <CardHeader className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Items in this order ({order.items?.length || 0})
            </h2>
          </CardHeader>

          {/* Items */}
          <CardBody className="p-5 divide-y divide-slate-100">
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
                      className="w-14 h-14 rounded-lg border border-slate-200 object-cover bg-slate-50 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.productName}</h4>
                      {item.variantTitle && (
                        <span className="text-xs text-slate-500 block">Option: {item.variantTitle}</span>
                      )}
                      <span className="text-xs text-slate-400">Qty: {item.quantity} × ₹{item.unitPrice}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-slate-900">
                      ₹{item.lineTotal?.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardBody>

          {/* Breakdown & Shipping */}
          <div className="p-5 bg-slate-50/80 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Shipping Address Snapshot */}
            <div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Address
              </h3>
              <div className="text-slate-600 space-y-0.5 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">{shipping.fullName}</div>
                <div>{shipping.phone}</div>
                <div>{shipping.addressLine1}</div>
                {shipping.addressLine2 && <div>{shipping.addressLine2}</div>}
                {shipping.landmark && <div>Landmark: {shipping.landmark}</div>}
                <div>
                  {shipping.city}, {shipping.state} - {shipping.postalCode}
                </div>
                <div className="text-slate-400">{shipping.country || 'IN'}</div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wide mb-2">
                Payment Summary
              </h3>
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{order.subtotal?.toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Coupon Discount ({order.couponCode || 'APPLIED'})
                    </span>
                    <span>- ₹{order.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping ({shippingSnapshot.name || order.shippingMethod || 'Standard'})</span>
                  <span className="font-semibold text-emerald-600">
                    {order.shippingAmount === 0 ? 'FREE' : `₹${order.shippingAmount}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (Included)</span>
                  <span className="text-slate-500">
                    {taxSnapshot.ratePercent ? `${taxSnapshot.ratePercent}% (₹${order.taxAmount})` : 'Included'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">Total Paid/Due</span>
                  <span className="font-extrabold text-slate-900 text-base">
                    ₹{order.grandTotal?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/products">
            <Button variant="primary" leftIcon={<ShoppingBag className="w-4 h-4" />}>
              Continue Shopping
            </Button>
          </Link>
          <Link to="/account?tab=orders">
            <Button variant="outline">
              View All Your Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
