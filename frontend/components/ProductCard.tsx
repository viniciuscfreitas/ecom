"use client";

import Link from "next/link";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      quantity: 1,
      price: Number(product.price),
      name: product.name,
    });
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/produtos/${product.id}`}>
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-4">
          {product.description || "Sem descrição"}
        </p>
        <p className="text-2xl font-bold text-green-600 mb-2">
          R$ {Number(product.price).toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Estoque: {product.stock}
        </p>
      </Link>
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {product.stock === 0 ? "Fora de estoque" : "Adicionar ao Carrinho"}
      </button>
    </div>
  );
}

