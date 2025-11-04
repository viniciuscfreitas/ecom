"use client";

import { useState, useEffect } from "react";
import { getCart, addToCart, removeFromCart, updateCartItem, type CartItem } from "./cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const updateCart = () => {
    setItems(getCart());
  };

  useEffect(() => {
    updateCart();

    const handleCartUpdated = () => {
      updateCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    count,
    add: (item: CartItem) => {
      addToCart(item);
      updateCart();
    },
    remove: (productId: string) => {
      removeFromCart(productId);
      updateCart();
    },
    update: (productId: string, quantity: number) => {
      updateCartItem(productId, quantity);
      updateCart();
    },
  };
}

