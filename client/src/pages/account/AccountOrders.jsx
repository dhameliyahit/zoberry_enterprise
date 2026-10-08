import React from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Package, ArrowUpRight, Calendar, ShoppingBag } from 'lucide-react';
import { GET_MY_ORDERS } from '../../graphql/orders';
import { Card, CardBody, CardHeader, StatusBadge, Button, EmptyState } from '../../components/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const AccountOrders = () => {
  const { data, loading, error } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: 'cache-and-network',
  });

  const orders = data?.getMyOrders || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Your Order History</h2>
        <p className="text-slate-500 text-xs mt-0.5">Track, review, and view invoices of all your purchases</p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-medium">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center max-w-md mx-auto">
          <EmptyState
            icon={Package}
            title="No Orders Placed Yet"
            description="You haven't placed any orders with us yet. Discover our catalog of quality essentials."
            actionLabel="Start Shopping"
            onAction={() => window.location.href = '/products'}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <Card
                key={order.id}
                className="overflow-hidden hover:border-slate-300 transition-all shadow-xs"
              >
                {/* Header Strip */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Number</span>
                      <span className="font-bold text-slate-900">{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Placed</span>
                      <span className="text-slate-700 font-medium">{dateStr}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                      <span className="font-bold text-slate-900">₹{order.grandTotal?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} type="order" />
                    <Link
                      to={`/order/${order.orderNumber}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-1"
                    >
                      View Order <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <CardBody className="p-4 divide-y divide-slate-100">
                  {order.items?.map((item) => {
                    const img = item.productImage;
                    const imageUrl = img
                      ? (img.startsWith('http') ? img : `${API_URL}${img}`)
                      : 'https://placehold.co/80x80?text=Item';

                    return (
                      <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl}
                            alt={item.productName}
                            className="w-12 h-12 rounded-lg border border-slate-200 object-cover bg-slate-50 shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {item.productName}
                            </h4>
                            {item.variantTitle && (
                              <span className="text-[11px] text-slate-500 block">Option: {item.variantTitle}</span>
                            )}
                            <div className="text-[11px] text-slate-400">Qty: {item.quantity} × ₹{item.unitPrice}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-900">
                            ₹{item.lineTotal?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountOrders;
