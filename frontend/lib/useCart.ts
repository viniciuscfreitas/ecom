"use client";

import { useState, useEffect } from "react";
import { getCart } from "./cart";

export function useCart() {
  const [items, setItems] = useState(getCart());

  useEffect(() => {
    const updateCart = () => {
      setItems(getCart());
    };

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

  return { items, count };
}

