"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { addToCart } from "@/lib/cart";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Voltar para home
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      quantity: 1,
      price: Number(product.price),
      name: product.name,
    });
    alert("Produto adicionado ao carrinho!");
  };

  const price = Number(product.price);
  const showInstallment = price > 100;
  const installmentValue = (price / 3).toFixed(2);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-green-600 hover:text-green-700 font-medium mb-6 inline-block"
        >
          ← Voltar
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                  <svg
                    className="w-24 h-24 text-gray-400"
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
            </div>

            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <p className="text-4xl font-bold text-green-600">
                    R$ {price.toFixed(2)}
                  </p>
                  {product.stock > 0 && (
                    <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                      Em estoque
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                      Esgotado
                    </span>
                  )}
                </div>
                {showInstallment && (
                  <p className="text-gray-600 text-lg">
                    ou 3x de R$ {installmentValue} sem juros
                  </p>
                )}
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Entrega Rápida:</strong> Receba em até 48h em sua região
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg"
              >
                {product.stock === 0
                  ? "Fora de estoque"
                  : "Adicionar ao Carrinho"}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Estoque disponível:</strong> {product.stock} unidade(s)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

