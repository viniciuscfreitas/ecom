"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/useCart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart } from "lucide-react";

export default function Header() {
  const { count: itemCount } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
            Pet Shop
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl w-full mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="O que seu pet precisa?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/categoria/cachorro"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Cachorro
              </Link>
              <Link
                href="/categoria/gato"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Gato
              </Link>
              <Link
                href="/categoria/aves"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Aves
              </Link>
              <Link
                href="/categoria/farmacia"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Farmácia
              </Link>
            </nav>
            <Link
              href="/carrinho"
              className="relative flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="hidden md:inline">Carrinho</span>
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 md:static md:ml-0 h-5 min-w-5 px-1.5 flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

