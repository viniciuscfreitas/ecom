"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { useCart } from "@/lib/useCart";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id as string;
  const { add } = useCart();

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
        <div className="text-center">Produto não encontrado</div>
        <Link href="/" className="text-blue-600 hover:underline">
          Voltar para home
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    add({
      productId: product.id,
      quantity: 1,
      price: Number(product.price),
      name: product.name,
    });
    alert("Produto adicionado ao carrinho!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 block">
        ← Voltar
      </Link>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-gray-600 mb-6">{product.description || "Sem descrição"}</p>
        <p className="text-3xl font-bold text-green-600 mb-4">
          R$ {Number(product.price).toFixed(2)}
        </p>
        <p className="text-gray-500 mb-6">Estoque: {product.stock}</p>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? "Fora de estoque" : "Adicionar ao Carrinho"}
        </button>
      </div>
    </div>
  );
}

