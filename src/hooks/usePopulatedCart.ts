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
        const promises = cartItems.map(async (item) => {
          // If we already have the details, use them
          const existing = populatedItems.find((pop) => pop._id === item._id);
          if (existing) {
            return {
              ...existing,
              quantity: item.quantity,
            };
          }
          // Otherwise, fetch from API
          try {
            const res = await productService.getById(item._id);
            if (res.data) {
              return {
                ...res.data,
                quantity: item.quantity,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch product details for ID: ${item._id}`, err);
          }
          return null;
        });

        const results = await Promise.all(promises);
        if (isMounted) {
          // Filter out null values
          const validItems = results.filter(
            (item): item is PopulatedCartItem => item !== null && item._id !== undefined
          );
          setPopulatedItems(validItems);
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
