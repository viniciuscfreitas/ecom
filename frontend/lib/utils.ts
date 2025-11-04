import type { Order, OrderItem } from "./types";

export function calculateOrderTotal(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
}

export function calculateOrderSubtotal(items: OrderItem[]): number {
  return items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
}

