import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiShoppingBag, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import SEO from '../components/common/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <SEO
        title="Your Shopping Cart | Zoberry Enterprise"
        description="Review items in your cart, update quantities, and proceed securely to checkout."
        url="/cart"
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              {hasItems ? `You have ${cart.itemCount} item(s) in your cart` : 'Your cart is currently empty'}
            </p>
          </div>
          {hasItems && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {!hasItems ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag size={28} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">
              Looks like you haven't added anything yet. Explore our top categories and utilities!
            </p>
            <Link to="/products" className="btn-primary inline-flex">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Cart Items (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-lg border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item) => {
                const img = item.product?.images?.[0];
                const imageUrl = img
                  ? (img.startsWith('http') ? img : `${API_URL}${img}`)
                  : 'https://placehold.co/100x100?text=No+Image';

                return (
                  <div key={item.id} className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                    {/* Product & Variant */}
                    <div className="col-span-6 flex items-center gap-4 w-full">
                      <Link
                        to={`/product/${item.product?.slug}`}
                        className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded border border-gray-100 overflow-hidden shrink-0"
                      >
                        <img
                          src={imageUrl}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product?.slug}`}
                          className="text-sm font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.product?.name}
                        </Link>
                        {item.variant && (
                          <span className="inline-block text-xs text-gray-500 mt-1">
                            Option: <span className="font-semibold text-gray-700">{item.variant.title}</span>
                          </span>
                        )}
                        <div className="mt-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <FiTrash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2 text-center text-sm text-gray-600 hidden md:block">
                      Rs. {item.unitPrice.toLocaleString()}
                    </div>

                    {/* Quantity Selector */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading || item.quantity <= 1}
                          className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-40"
                          title="Decrease"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-900 min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading || (item.availableStock && item.quantity >= item.availableStock)}
                          className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-40"
                          title="Increase"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="col-span-2 text-right w-full md:w-auto flex md:block justify-between items-center">
                      <span className="text-xs text-gray-500 md:hidden">Subtotal:</span>
                      <span className="text-sm font-bold text-gray-900">
                        Rs. {item.lineTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Order Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
                <h2 className="text-base font-bold text-gray-900 pb-4 border-b border-gray-100 uppercase tracking-wide">
                  Order Summary
                </h2>

                <div className="py-4 space-y-3 text-sm border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">Rs. {cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Shipping</span>
                    <span className="text-emerald-600 font-semibold">Free Express</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Taxes</span>
                    <span className="text-gray-500">Included in price</span>
                  </div>
                </div>

                <div className="py-4 flex justify-between items-end">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Estimated Total</span>
                    <span className="text-xl font-extrabold text-secondary">Rs. {cart.subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="btn-primary w-full py-3.5 text-xs tracking-wider mt-2"
                >
                  Proceed to Checkout <FiArrowRight size={14} />
                </button>

                <div className="mt-4 text-center">
                  <Link
                    to="/products"
                    className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-3">
                  <FiShield className="text-primary shrink-0" size={18} />
                  <span>100% Genuine and Quality Inspected Products</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiTruck className="text-primary shrink-0" size={18} />
                  <span>Fast Dispatch within 24-48 Business Hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiRefreshCw className="text-primary shrink-0" size={18} />
                  <span>Easy 7-Day Replacement Policy for damaged goods</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
