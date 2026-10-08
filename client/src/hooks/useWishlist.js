import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_WISHLIST, TOGGLE_WISHLIST, REMOVE_FROM_WISHLIST } from '../graphql/wishlist';
import { useUIStore } from '../store/uiStore';
import { useEffect } from 'react';

export const useWishlist = () => {
  const { user, wishlistIds, setWishlistIds, toggleWishlistId, addToast, openAuthModal } = useUIStore();

  const { data, loading, error, refetch } = useQuery(GET_MY_WISHLIST, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const wishlist = data?.getMyWishlist || [];

  useEffect(() => {
    if (data?.getMyWishlist) {
      const newIds = data.getMyWishlist.map((p) => p.id);
      const currentIds = Array.from(wishlistIds);
      const isDifferent =
        newIds.length !== currentIds.length ||
        newIds.some((id, idx) => id !== currentIds[idx]);

      if (isDifferent) {
        setWishlistIds(newIds);
      }
    }
  }, [data?.getMyWishlist]);

  const [toggleWishlistMutation] = useMutation(TOGGLE_WISHLIST, {
    refetchQueries: [{ query: GET_MY_WISHLIST }],
  });

  const [removeWishlistMutation] = useMutation(REMOVE_FROM_WISHLIST, {
    refetchQueries: [{ query: GET_MY_WISHLIST }],
  });

  const toggleWishlist = async (product) => {
    if (!user) {
      addToast('Please log in to save items to your wishlist', 'info');
      openAuthModal('login');
      return false;
    }

    try {
      toggleWishlistId(product.id);
      const res = await toggleWishlistMutation({
        variables: { productId: product.id },
      });
      const isNowSaved = res.data?.toggleWishlist;
      if (isNowSaved) {
        addToast(`"${product.name}" added to your wishlist!`, 'success');
      } else {
        addToast(`"${product.name}" removed from wishlist`, 'info');
      }
      return isNowSaved;
    } catch (err) {
      addToast(err.message?.replace('GraphQL error: ', '') || 'Failed to update wishlist', 'error');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    try {
      toggleWishlistId(productId);
      await removeWishlistMutation({
        variables: { productId },
      });
      addToast('Removed from wishlist', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to remove from wishlist', 'error');
    }
  };

  const isSaved = (productId) => {
    return wishlistIds.has(productId);
  };

  return {
    wishlist,
    loading: user ? loading : false,
    error,
    refetch,
    toggleWishlist,
    removeFromWishlist,
    isSaved,
  };
};
