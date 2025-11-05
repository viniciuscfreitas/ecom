"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { cn } from "@/lib/utils";

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
    <div className="h-screen flex bg-white">
      <aside className="w-48 border-r border-gray-300 bg-gray-50">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-300 px-4 py-3">
            <div className="text-sm font-medium text-gray-900">ADMIN</div>
          </div>
          <nav className="flex-1 py-2">
            <button
              onClick={() => router.push("/admin/pedidos")}
              className={cn(
                "w-full text-left px-4 py-2 text-sm",
                pathname === "/admin/pedidos"
                  ? "bg-gray-200 text-gray-900 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              Pedidos
            </button>
            <button
              onClick={() => router.push("/admin/produtos")}
              className={cn(
                "w-full text-left px-4 py-2 text-sm",
                pathname === "/admin/produtos"
                  ? "bg-gray-200 text-gray-900 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              Produtos
            </button>
          </nav>
          <div className="border-t border-gray-300 px-4 py-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

