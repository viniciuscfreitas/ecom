"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import type { Product } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

const categoryMap: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
  aves: "Aves",
  farmacia: "Farmácia",
};

function CategoryContent() {
  const params = useParams();
  const slug = params.slug as string;
  const categoryName = categoryMap[slug] || slug;

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", categoryName],
    queryFn: async () => {
      const response = await api.get(`/products?category=${encodeURIComponent(categoryName)}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para home
            </Link>
            <h1 className="text-3xl font-bold">Categoria: {categoryName}</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Categoria: {categoryName}</h1>
          <p className="text-muted-foreground">
            {products?.length || 0} produto(s) encontrado(s)
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Nenhum produto encontrado nesta categoria
            </p>
            <Link
              href="/"
              className="text-primary hover:text-primary/90 font-medium inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver todos os produtos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}

