"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingCart, Package } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAdminAuth();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <aside className="w-64 border-r bg-muted/40">
          <div className="flex h-full flex-col">
            <div className="border-b p-6">
              <h2 className="text-xl font-bold">Admin Panel</h2>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              <Button
                variant={pathname === "/admin/pedidos" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => router.push("/admin/pedidos")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Pedidos
              </Button>
              <Button
                variant={pathname === "/admin/produtos" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => router.push("/admin/produtos")}
              >
                <Package className="mr-2 h-4 w-4" />
                Produtos
              </Button>
            </nav>
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

