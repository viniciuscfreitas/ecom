"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";

export default function Header() {
  const itemCount = useCart();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
            Pet Shop
          </Link>
          <Link
            href="/carrinho"
            className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <span>Carrinho</span>
            {itemCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

