import { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/store";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import { useDispatch } from "react-redux";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";

export function usePopulatedWishlist() {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const dispatch = useDispatch();
  const [populatedItems, setPopulatedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const missingIds = wishlistItems.filter(
      (id) => !populatedItems.some((pop) => pop._id === id)
    );

    if (missingIds.length === 0) {
      setPopulatedItems((prev) =>
        prev.filter((pop) => wishlistItems.includes(pop._id))
      );
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchWishlistProducts = async () => {
      try {
        const promises = wishlistItems.map(async (id) => {
          const existing = populatedItems.find((pop) => pop._id === id);
          if (existing) {
            return existing;
          }
          try {
            const res = await productService.getById(id);
            if (res.data) {
              return res.data;
            }
          } catch (err) {
            console.error(`Failed to fetch wishlist product details for ID: ${id}`, err);
            dispatch(removeItemFromWishlist(id));
          }
          return null;
        });

        const results = await Promise.all(promises);
        if (isMounted) {
          // Filter out null/undefined results
          const validItems = results.filter((item): item is Product => item !== null && item._id !== undefined);
          setPopulatedItems(validItems);
        }
      } catch (error) {
        console.error("Error populating wishlist items:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWishlistProducts();

    return () => {
      isMounted = false;
    };
  }, [wishlistItems]);

  return {
    items: populatedItems,
    loading,
  };
}
