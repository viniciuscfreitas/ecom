"use client";

import Link from "next/link";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      quantity: 1,
      price: Number(product.price),
      name: product.name,
    });
  };

  const price = Number(product.price);
  const showInstallment = price > 100;
  const installmentValue = (price / 3).toFixed(2);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      <Link href={`/produtos/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Esgotado
            </div>
          )}
          {product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              Em estoque
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h2>
          <div className="mt-auto">
            <div className="mb-3">
              <p className="text-2xl font-bold text-green-600">
                R$ {price.toFixed(2)}
              </p>
              {showInstallment && (
                <p className="text-sm text-gray-500">
                  ou 3x de R$ {installmentValue} sem juros
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {product.stock === 0 ? "Fora de estoque" : "Adicionar ao Carrinho"}
        </button>
      </div>
    </div>
  );
}

