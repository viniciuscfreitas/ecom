"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import HeroBanner from "@/components/HeroBanner";
import type { Product } from "@/lib/types";

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", searchQuery],
    queryFn: async () => {
      const response = await api.get("/products");
      return response.data;
    },
  });

  const filteredProducts = searchQuery
    ? products?.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const featuredProducts = filteredProducts?.slice(0, 6) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeroBanner />
        <div className="container mx-auto px-4 py-8">
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
      <HeroBanner />
      <main id="produtos">
        {!searchQuery && featuredProducts.length > 0 && (
          <section className="bg-muted/50 py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Produtos em Destaque
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12">
          <div className="container mx-auto px-4">
            {searchQuery ? (
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  Resultados da busca: &quot;{searchQuery}&quot;
                </h2>
                <p className="text-muted-foreground">
                  {filteredProducts?.length || 0} produto(s) encontrado(s)
                </p>
              </div>
            ) : (
              <h2 className="text-3xl font-bold mb-8 text-center">
                Todos os Produtos
              </h2>
            )}

            {filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  Nenhum produto encontrado
                </p>
                {searchQuery && (
                  <a
                    href="/"
                    className="text-primary hover:text-primary/90 font-medium"
                  >
                    Ver todos os produtos
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <HeroBanner />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

