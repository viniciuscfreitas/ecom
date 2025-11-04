export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existingItem = cart.find((i) => i.productId === item.productId);

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter((item) => item.productId !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function updateCartItem(productId: string, quantity: number): void {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }
}

export function clearCart(): void {
  localStorage.removeItem("cart");
}

export function calculateTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

