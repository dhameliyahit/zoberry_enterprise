import { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/store";
import { productService } from "@/services/product.service";
import { Product } from "@/types";

export function usePopulatedWishlist() {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
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
        const existingPopulated = populatedItems.filter((item) => wishlistItems.includes(item._id));
        const idsToFetch = wishlistItems.filter((id) => !existingPopulated.some((item) => item._id === id));
        
        let fetched: Product[] = [];
        if (idsToFetch.length > 0) {
          const res = await productService.getBulk(idsToFetch);
          if (res.success && res.data) {
            fetched = res.data;
          }
        }
        
        if (isMounted) {
          const finalItems = wishlistItems.map((id) => {
            return existingPopulated.find((item) => item._id === id) || fetched.find((item) => item._id === id);
          }).filter((item): item is Product => !!item);
          
          setPopulatedItems(finalItems);
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
