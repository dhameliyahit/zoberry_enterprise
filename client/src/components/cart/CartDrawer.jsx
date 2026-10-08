import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { QuantitySelector } from '../ui/QuantitySelector';
import { EmptyState } from '../ui/EmptyState';
import { useUIStore } from '../../store/uiStore';
import { useCart } from '../../hooks/useCart';
import { getImageUrl } from '../../utils/imageUrl';

export function CartDrawer() {
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
    <Drawer
      isOpen={isCartOpen}
      onClose={closeCart}
      title={`Shopping Cart (${cart.itemCount || 0})`}
      width="max-w-md"
      footer={
        hasItems ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-slate-700">Subtotal</span>
              <span className="text-base font-extrabold text-slate-900">
                ₹{Number(cart.subtotal || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Shipping & taxes calculated accurately at checkout
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                onClick={handleViewCartClick}
                variant="outline"
                size="md"
                className="w-full"
              >
                View Full Cart
              </Button>
              <Button
                onClick={handleCheckoutClick}
                disabled={loading || !hasItems}
                variant="primary"
                size="md"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Checkout
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="flex flex-col h-full">
        {!hasItems ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Explore our curated collection of smart home utility items and organizers."
            actionLabel="Start Shopping"
            onAction={() => {
              closeCart();
              navigate('/products');
            }}
          />
        ) : (
          <div className="divide-y divide-slate-100 space-y-3">
            {items.map((item) => {
              const mainImg = item.product?.images?.[0]
                ? getImageUrl(item.product.images[0])
                : getImageUrl(null);

              return (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3.5 items-start">
                  {/* Item Image */}
                  <Link
                    to={`/product/${item.product?.slug}`}
                    onClick={closeCart}
                    className="w-18 h-18 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shrink-0"
                  >
                    <img
                      src={mainImg}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <Link
                        to={`/product/${item.product?.slug}`}
                        onClick={closeCart}
                        className="text-xs font-bold text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-snug"
                      >
                        {item.product?.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={loading}
                        aria-label="Remove item"
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.variant && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Option: <span className="font-semibold text-slate-700">{item.variant.title}</span>
                      </p>
                    )}

                    {!item.isAvailable && (
                      <div className="flex items-center gap-1 text-[11px] text-red-600 font-semibold mt-1">
                        <AlertTriangle className="w-3 h-3" /> Out of stock
                      </div>
                    )}

                    {/* Quantity Selector & Price */}
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-50">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(newQty) => updateQuantity(item.id, newQty)}
                        min={1}
                        max={item.availableStock || 99}
                        disabled={loading}
                        size="sm"
                      />

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">
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
        )}
      </div>
    </Drawer>
  );
}

export default CartDrawer;
