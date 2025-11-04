"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ImageIcon, Package } from "lucide-react";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

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
            className="text-primary hover:text-primary/90 font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para home
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
    toast.success("Produto adicionado ao carrinho!");
  };

  const price = Number(product.price);
  const showInstallment = price > 100;
  const installmentValue = (price / 3).toFixed(2);

  return (
    <div className="bg-muted/50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-primary hover:text-primary/90 font-medium mb-6 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <ImageIcon className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {product.name}
                  </h1>

                  {product.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-primary">
                      R$ {price.toFixed(2)}
                    </p>
                    {product.stock > 0 ? (
                      <Badge variant="default">Em estoque</Badge>
                    ) : (
                      <Badge variant="destructive">Esgotado</Badge>
                    )}
                  </div>
                  {showInstallment && (
                    <p className="text-muted-foreground text-lg">
                      ou 3x de R$ {installmentValue} sem juros
                    </p>
                  )}
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary">
                    <strong>Entrega Rápida:</strong> Receba em até 48h em sua região
                  </p>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  size="lg"
                  className="w-full"
                >
                  {product.stock === 0
                    ? "Fora de estoque"
                    : "Adicionar ao Carrinho"}
                </Button>

                <Separator />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>
                    <strong>Estoque disponível:</strong> {product.stock} unidade(s)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

