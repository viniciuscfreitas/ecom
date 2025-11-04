"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/useAdminAuth";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { calculateOrderSubtotal } from "@/lib/utils";

const statusOrder = ["PENDENTE", "PREPARANDO", "SAIU_PARA_ENTREGA", "ENTREGUE"];

export default function AdminOrders() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuth();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/orders");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await adminApi.patch(`/admin/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      updateStatusMutation.mutate({ orderId, status: nextStatus });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/admin/produtos")}
            className="text-blue-600 hover:text-blue-800"
          >
            Produtos
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              router.push("/admin/login");
            }}
            className="text-red-600 hover:text-red-800"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => {
          const subtotal = calculateOrderSubtotal(order.items);
          const shipping = order.shippingValue ? Number(order.shippingValue) : 0;
          const total = subtotal + shipping;
          const canUpdateStatus = order.status !== "ENTREGUE";

          return (
            <div key={order.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Status: {ORDER_STATUS_LABELS[order.status] || order.status}</p>
                  {order.paymentStatus && (
                    <p className="text-sm font-semibold">
                      Pagamento: {order.paymentStatus === "paid" ? "✅ Pago" : order.paymentStatus === "pending" ? "⏳ Pendente" : "❌ Expirado"}
                    </p>
                  )}
                  {order.deliveryTime && (
                    <p className="text-sm text-gray-600">
                      Horário: {order.deliveryTime === "MANHA" ? "Manhã (9h-12h)" : "Tarde (14h-18h)"}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-semibold mb-2">Itens:</p>
                <ul className="list-disc list-inside space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.product.name} x {item.quantity} - R${" "}
                      {(Number(item.price) * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">Subtotal: R$ {subtotal.toFixed(2)}</p>
                  {shipping > 0 && (
                    <p className="text-sm">Frete: R$ {shipping.toFixed(2)}</p>
                  )}
                  <p className="font-semibold">Total: R$ {total.toFixed(2)}</p>
                </div>
              </div>

              {order.address && (
                <div className="mb-4">
                  <p className="font-semibold mb-2">Endereço:</p>
                  <p className="text-sm text-gray-600">
                    {order.address.street}, {order.address.number}
                    {order.address.complement && `, ${order.address.complement}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.address.neighborhood}, {order.address.city} - {order.address.zipCode}
                  </p>
                </div>
              )}

              {canUpdateStatus && (
                <button
                  onClick={() => handleStatusUpdate(order.id, order.status)}
                  disabled={updateStatusMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {updateStatusMutation.isPending
                    ? "Atualizando..."
                    : `Atualizar para: ${
                        ORDER_STATUS_LABELS[
                          statusOrder[statusOrder.indexOf(order.status) + 1]
                        ]
                      }`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

