import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import Drawer from '../common/Drawer';
import { useUIStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUIStore();
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    closeCart();
    navigate('/cart');
  };

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  return (
    <Drawer isOpen={isCartOpen} onClose={closeCart} title={`Shopping Cart (${cart.itemCount || 0})`}>
      <div className="flex flex-col h-full">
        {!hasItems ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <FiShoppingCart size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-secondary mb-1">Your cart is empty</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Explore our wide collection of home utility items and organizers.
            </p>
            <button
              onClick={() => {
                closeCart();
                navigate('/products');
              }}
              className="btn-primary w-full max-w-xs"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-4 space-y-4">
              {items.map((item) => {
                const img = item.product?.images?.[0];
                const imageUrl = img
                  ? (img.startsWith('http') ? img : `${API_URL}${img}`)
                  : 'https://placehold.co/100x100?text=No+Image';

                return (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3">
                    {/* Thumbnail */}
                    <Link
                      to={`/product/${item.product?.slug}`}
                      onClick={closeCart}
                      className="w-20 h-20 bg-gray-50 rounded border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center"
                    >
                      <img
                        src={imageUrl}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${item.product?.slug}`}
                            onClick={closeCart}
                            className="text-xs font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2 leading-snug"
                          >
                            {item.product?.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors shrink-0"
                            title="Remove item"
                            disabled={loading}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>

                        {item.variant && (
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Option: <span className="font-semibold text-gray-700">{item.variant.title}</span>
                          </div>
                        )}

                        {!item.isAvailable && (
                          <div className="flex items-center gap-1 text-[11px] text-red-600 font-semibold mt-1">
                            <FiAlertTriangle size={12} /> Out of stock
                          </div>
                        )}
                      </div>

                      {/* Controls & Price */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-gray-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Decrease"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-800 min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={loading || (item.availableStock && item.quantity >= item.availableStock)}
                            className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Increase"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">
                            Rs. {item.lineTotal.toLocaleString()}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-gray-400">
                              (Rs. {item.unitPrice} each)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-1">
                  <span>Subtotal</span>
                  <span>Rs. {cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckoutClick}
                  disabled={loading || !hasItems}
                  className="btn-primary w-full py-3.5 text-xs tracking-wider"
                >
                  Proceed to Checkout <FiArrowRight size={14} />
                </button>
                <button
                  onClick={handleViewCartClick}
                  className="btn-outline w-full py-2.5 text-xs"
                >
                  View Full Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default CartDrawer;
