import React from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight, FiClock, FiCalendar, FiArrowUpRight } from 'react-icons/fi';
import { GET_MY_ORDERS } from '../../graphql/orders';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const getStatusBadge = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PROCESSING':
    case 'CONFIRMED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const AccountOrders = () => {
  const { data, loading, error } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: 'cache-and-network',
  });

  const orders = data?.getMyOrders || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Order History</h2>
        <p className="text-gray-500 text-xs mt-1">Track, review, and view details of all your orders</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center max-w-md mx-auto">
          <FiPackage className="text-gray-300 mx-auto mb-3" size={40} />
          <h3 className="text-sm font-bold text-gray-800 mb-1">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500 mb-6">
            You haven't placed any orders with us yet. Start shopping now!
          </p>
          <Link to="/products" className="btn-primary inline-flex text-xs">
            Start Shopping
          </Link>
        </div>
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
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:border-gray-300 transition-all"
              >
                {/* Header Strip */}
                <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Order Number</span>
                      <span className="font-bold text-gray-900">{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Date Placed</span>
                      <span className="text-gray-700 font-medium">{dateStr}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Amount</span>
                      <span className="font-bold text-gray-900">Rs. {order.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border uppercase tracking-wider ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <Link
                      to={`/order/${order.orderNumber}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-2"
                    >
                      View Details <FiArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-4 divide-y divide-gray-100">
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
                            className="w-12 h-12 rounded border border-gray-100 object-cover bg-gray-50 shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                              {item.productName}
                            </h4>
                            {item.variantTitle && (
                              <span className="text-[11px] text-gray-500">Option: {item.variantTitle}</span>
                            )}
                            <div className="text-[11px] text-gray-400">Qty: {item.quantity} × Rs. {item.unitPrice}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-gray-900">
                            Rs. {item.lineTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountOrders;
