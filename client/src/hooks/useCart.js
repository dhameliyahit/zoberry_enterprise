import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_CART, ADD_TO_CART, UPDATE_CART_ITEM, REMOVE_CART_ITEM, CLEAR_CART, MERGE_GUEST_CART } from '../graphql/cart';
import { getGuestSessionToken } from '../utils/guestToken';
import { useUIStore } from '../store/uiStore';
import { useEffect } from 'react';

export const useCart = () => {
  const guestSessionToken = getGuestSessionToken();
  const { setCartCount, addToast } = useUIStore();

  const { data, loading, error, refetch } = useQuery(GET_MY_CART, {
    variables: { guestSessionToken },
    fetchPolicy: 'cache-and-network',
  });

  const cart = data?.getMyCart || {
    items: [],
    itemCount: 0,
    subtotal: 0,
    discountAmount: 0,
    shippingAmount: 0,
    taxAmount: 0,
    grandTotal: 0,
  };

  useEffect(() => {
    if (cart && typeof cart.itemCount === 'number') {
      setCartCount(cart.itemCount);
    }
  }, [cart?.itemCount, setCartCount]);

  const [addToCartMutation, { loading: adding }] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_MY_CART, variables: { guestSessionToken } }],
  });

  const [updateCartItemMutation, { loading: updating }] = useMutation(UPDATE_CART_ITEM, {
    refetchQueries: [{ query: GET_MY_CART, variables: { guestSessionToken } }],
  });

  const [removeCartItemMutation, { loading: removing }] = useMutation(REMOVE_CART_ITEM, {
    refetchQueries: [{ query: GET_MY_CART, variables: { guestSessionToken } }],
  });

  const [clearCartMutation, { loading: clearing }] = useMutation(CLEAR_CART, {
    refetchQueries: [{ query: GET_MY_CART, variables: { guestSessionToken } }],
  });

  const [mergeGuestCartMutation] = useMutation(MERGE_GUEST_CART, {
    refetchQueries: [{ query: GET_MY_CART, variables: { guestSessionToken } }],
  });

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    try {
      const res = await addToCartMutation({
        variables: {
          productId,
          variantId,
          quantity,
          guestSessionToken,
        },
      });
      addToast('Item added to your shopping cart!', 'success');
      return res.data?.addToCart;
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to add item to cart', 'error');
      throw err;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await updateCartItemMutation({
        variables: {
          cartItemId,
          quantity,
          guestSessionToken,
        },
      });
      return res.data?.updateCartItem;
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to update item quantity', 'error');
      throw err;
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await removeCartItemMutation({
        variables: {
          cartItemId,
          guestSessionToken,
        },
      });
      addToast('Item removed from cart', 'info');
      return res.data?.removeCartItem;
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to remove item', 'error');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await clearCartMutation({
        variables: { guestSessionToken },
      });
      addToast('Cart cleared', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to clear cart', 'error');
    }
  };

  const mergeCart = async () => {
    try {
      if (guestSessionToken) {
        await mergeGuestCartMutation({
          variables: { guestSessionToken },
        });
      }
    } catch (err) {
      console.error('Guest cart merge error:', err);
    }
  };

  return {
    cart,
    loading: loading || adding || updating || removing || clearing,
    error,
    refetch,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    mergeCart,
  };
};
