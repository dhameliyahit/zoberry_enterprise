import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowRight, FiShoppingBag, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { EmptyState } from '../components/ui/EmptyState';
import { SEO } from '../components/common/SEO';
import { getImageUrl } from '../utils/imageUrl';

export function CartPage() {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <SEO
        title="Your Shopping Cart | Zoberry Enterprise"
        description="Review items in your cart, update quantities, and proceed securely to checkout."
        url="/cart"
      />

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        {/* Page Title */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {hasItems
                ? `You have ${cart.itemCount} item(s) in your cart`
                : 'Your cart is currently empty'}
            </p>
          </div>
          {hasItems && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {!hasItems ? (
          <EmptyState
            icon={FiShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything to your cart yet. Explore our top utility items!"
            actionLabel="Explore Products"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                {items.map((item) => {
                  const mainImg = item.product?.images?.[0]
                    ? getImageUrl(item.product.images[0])
                    : getImageUrl(null);

                  return (
                    <div key={item.id} className="p-4 sm:p-5 flex gap-4 items-start">
                      {/* Thumbnail */}
                      <Link
                        to={`/product/${item.product?.slug}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shrink-0"
                      >
                        <img
                          src={mainImg}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/product/${item.product?.slug}`}
                              className="text-xs sm:text-sm font-bold text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-snug"
                            >
                              {item.product?.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove product from cart"
                              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors shrink-0"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {item.variant && (
                            <span className="inline-block text-xs text-slate-500 mt-1">
                              Option:{' '}
                              <span className="font-semibold text-slate-700">
                                {item.variant.title}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Quantity Counter & Line Total */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(newQty) => updateQuantity(item.id, newQty)}
                            min={1}
                            max={item.availableStock || 99}
                            disabled={loading}
                            size="sm"
                          />

                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900">
                              ₹{Number(item.lineTotal || 0).toLocaleString('en-IN')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="block text-[10px] text-slate-400">
                                (₹{Number(item.unitPrice || 0).toLocaleString('en-IN')} each)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Order Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardBody className="p-6 space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Order Summary
                  </h2>

                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-900">
                        ₹{Number(cart.subtotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Shipping</span>
                      <span className="text-slate-500">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Tax</span>
                      <span className="text-slate-500">Included in prices</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Estimated Subtotal
                    </span>
                    <span className="text-xl font-extrabold text-slate-900">
                      ₹{Number(cart.subtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Button
                    onClick={() => navigate('/checkout')}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    rightIcon={<FiArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Checkout
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      to="/products"
                      className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
                    >
                      &larr; Continue Shopping
                    </Link>
                  </div>
                </CardBody>
              </Card>

              {/* Trust Guarantees */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <FiShield className="w-4 h-4 text-primary shrink-0" />
                  <span>100% Secure PhonePe Digital Payments</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiTruck className="w-4 h-4 text-primary shrink-0" />
                  <span>Free Standard Delivery on Orders Over ₹999</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiRefreshCw className="w-4 h-4 text-primary shrink-0" />
                  <span>7-Day Replacement Policy for Transit Damage</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
