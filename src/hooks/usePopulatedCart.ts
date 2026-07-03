import { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/store";
import { productService } from "@/services/product.service";
import { Product } from "@/types";

export interface PopulatedCartItem extends Product {
  quantity: number;
}

export function usePopulatedCart() {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const [populatedItems, setPopulatedItems] = useState<PopulatedCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Determine which items are missing from populatedItems
    const missingIds = cartItems.filter(
      (item) => !populatedItems.some((pop) => pop._id === item._id)
    );

    // If there are no missing items, we just update the quantities and filter out removed items
    if (missingIds.length === 0) {
      setPopulatedItems((prev) => {
        // Filter out items that are no longer in cartItems
        const remaining = prev.filter((pop) =>
          cartItems.some((item) => item._id === pop._id)
        );
        // Map updated quantities
        return remaining.map((pop) => {
          const cartItem = cartItems.find((item) => item._id === pop._id);
          return {
            ...pop,
            quantity: cartItem ? cartItem.quantity : pop.quantity,
          };
        });
      });
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchCartProducts = async () => {
      try {
        const existingPopulated = populatedItems.filter((pop) => cartItems.some((item) => item._id === pop._id));
        const idsToFetch = cartItems.filter((item) => !existingPopulated.some((pop) => pop._id === item._id)).map((item) => item._id);
        
        let fetched: Product[] = [];
        if (idsToFetch.length > 0) {
          const res = await productService.getBulk(idsToFetch);
          if (res.success && res.data) {
            fetched = res.data;
          }
        }
        
        if (isMounted) {
          const finalItems = cartItems.map((cartItem) => {
            const prod = existingPopulated.find((pop) => pop._id === cartItem._id) || fetched.find((f) => f._id === cartItem._id);
            if (prod) {
              return {
                ...prod,
                quantity: cartItem.quantity,
              };
            }
            return null;
          }).filter((item): item is PopulatedCartItem => !!item);
          
          setPopulatedItems(finalItems);
        }
      } catch (error) {
        console.error("Error populating cart items:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCartProducts();

    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  const totalPrice = populatedItems.reduce((total, item) => {
    const itemPrice = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  return {
    items: populatedItems,
    loading,
    totalPrice,
  };
}
