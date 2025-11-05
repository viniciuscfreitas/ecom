"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/useAdminAuth";

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
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        <aside className="w-48 border-r border-gray-200 bg-gray-50">
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-medium text-gray-900">Admin</div>
            </div>
            <nav className="flex-1 space-y-0.5 p-2">
              <button
                onClick={() => router.push("/admin/pedidos")}
                className={`w-full text-left px-3 py-2 text-sm ${
                  pathname === "/admin/pedidos"
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Pedidos
              </button>
              <button
                onClick={() => router.push("/admin/produtos")}
                className={`w-full text-left px-3 py-2 text-sm ${
                  pathname === "/admin/produtos"
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Produtos
              </button>
            </nav>
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
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
    </div>
  );
}
