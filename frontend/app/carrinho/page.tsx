"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";
import { calculateTotal, removeFromCart, updateCartItem } from "@/lib/cart";

export default function Cart() {
  const { items: cart } = useCart();

  const total = calculateTotal(cart);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Carrinho</h1>
        <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho</h1>
      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div key={item.productId} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">R$ {item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                  className="bg-gray-200 px-3 py-1 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                  className="bg-gray-200 px-3 py-1 rounded"
                >
                  +
                </button>
              </div>
              <p className="font-semibold">
                R$ {(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total:</span>
          <span className="text-2xl font-bold text-green-600">
            R$ {total.toFixed(2)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="block w-full bg-blue-600 text-white text-center py-3 rounded hover:bg-blue-700"
        >
          Finalizar Compra
        </Link>
      </div>
    </div>
  );
}

