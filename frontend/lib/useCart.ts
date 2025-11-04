"use client";

import { useState, useEffect } from "react";
import { getCart } from "./cart";

export function useCart() {
  const [itemCount, setItemCount] = useState(0);

  const updateCount = () => {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setItemCount(count);
  };

  useEffect(() => {
    updateCount();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        updateCount();
      }
    };

    const handleCartUpdated = () => {
      updateCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  return itemCount;
}

