import React from 'react';
import Drawer from '../common/Drawer';
import { useUIStore } from '../../store/uiStore';
import { FiShoppingCart } from 'react-icons/fi';

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUIStore();

  return (
    <Drawer isOpen={isCartOpen} onClose={closeCart} title="Your Shopping Cart">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-50 p-8 rounded-full mb-6">
          <FiShoppingCart size={56} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-secondary mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-8 max-w-[250px]">
          Looks like you haven't added anything to your cart yet.
        </p>
        <button onClick={closeCart} className="btn-primary w-full max-w-xs text-lg py-3">
          Continue Shopping
        </button>
      </div>
    </Drawer>
  );
};

export default CartDrawer;
