"use client";

import Link from "next/link";
import Image from "next/image";
import { addToCart } from "@/lib/cart";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

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
    toast.success("Produto adicionado ao carrinho!");
  };

  const price = Number(product.price);
  const showInstallment = price > 100;
  const installmentValue = (price / 3).toFixed(2);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <Link href={`/produtos/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Esgotado
            </Badge>
          )}
          {product.stock > 0 && (
            <Badge variant="default" className="absolute top-2 right-2">
              Em estoque
            </Badge>
          )}
        </div>
        <CardHeader className="flex-1 flex flex-col">
          <h2 className="text-lg font-semibold line-clamp-2">
            {product.name}
          </h2>
          <div className="mt-auto space-y-1">
            <p className="text-2xl font-bold text-primary">
              R$ {price.toFixed(2)}
            </p>
            {showInstallment && (
              <p className="text-sm text-muted-foreground">
                ou 3x de R$ {installmentValue} sem juros
              </p>
            )}
          </div>
        </CardHeader>
      </Link>
      <CardFooter className="pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full"
          size="lg"
        >
          {product.stock === 0 ? "Fora de estoque" : "Adicionar ao Carrinho"}
        </Button>
      </CardFooter>
    </Card>
  );
}

