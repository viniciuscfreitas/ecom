"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { toast } from "sonner";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

const statusOrder = ["PENDENTE", "PREPARANDO", "SAIU_PARA_ENTREGA", "ENTREGUE"];

type OrderType = "all" | "delivery" | "ecommerce";
type StatusFilter = "all" | "PENDENTE" | "PREPARANDO" | "SAIU_PARA_ENTREGA" | "ENTREGUE";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuth();
  const [typeFilter, setTypeFilter] = useState<OrderType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
      toast.success("Status atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      updateStatusMutation.mutate({ orderId, status: nextStatus });
    }
  };

  const getOrderType = (order: Order): "delivery" | "ecommerce" => {
    if (order.address && order.deliveryTime) {
      return "delivery";
    }
    return "ecommerce";
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      const orderType = getOrderType(order);
      const typeMatch = typeFilter === "all" || orderType === typeFilter;
      const statusMatch = statusFilter === "all" || order.status === statusFilter;
      return typeMatch && statusMatch;
    });
  }, [orders, typeFilter, statusFilter]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">
          Pedidos ({filteredOrders.length})
        </h1>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as OrderType)}
            className="rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="all">Todos</option>
            <option value="delivery">Delivery</option>
            <option value="ecommerce">E-commerce</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="all">Todos</option>
            <option value="PENDENTE">{ORDER_STATUS_LABELS.PENDENTE}</option>
            <option value="PREPARANDO">{ORDER_STATUS_LABELS.PREPARANDO}</option>
            <option value="SAIU_PARA_ENTREGA">{ORDER_STATUS_LABELS.SAIU_PARA_ENTREGA}</option>
            <option value="ENTREGUE">{ORDER_STATUS_LABELS.ENTREGUE}</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-sm text-gray-500">Nenhum pedido encontrado</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  ID
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  Tipo
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  Cliente
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  Status
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  Pagamento
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  Valor
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  Data
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const subtotal = order.items.reduce(
                  (sum, item) => sum + Number(item.price) * item.quantity,
                  0
                );
                const shipping = order.shippingValue ? Number(order.shippingValue) : 0;
                const total = subtotal + shipping;
                const canUpdateStatus = order.status !== "ENTREGUE";
                const orderType = getOrderType(order);
                const currentIndex = statusOrder.indexOf(order.status);
                const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
                const isExpanded = expandedOrder === order.id;

                return (
                  <>
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <td className="border border-gray-200 px-3 py-2 font-mono text-xs text-gray-600">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-xs">
                        {orderType === "delivery" ? "DEL" : "ECO"}
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        <div className="text-xs">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-xs">
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-xs">
                        {order.paymentStatus === "paid" ? "Pago" : order.paymentStatus === "pending" ? "Pendente" : order.paymentStatus || "-"}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 font-mono text-xs">
                        R$ {total.toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        {canUpdateStatus && nextStatus && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, order.status);
                            }}
                            disabled={updateStatusMutation.isPending}
                            className="text-xs text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
                          >
                            → {ORDER_STATUS_LABELS[nextStatus]}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="border border-gray-200 bg-gray-50 px-3 py-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <div className="font-medium text-gray-700 mb-1">Cliente</div>
                                <div className="text-gray-600">{order.customerName}</div>
                                <div className="text-gray-600">{order.customerEmail}</div>
                                <div className="text-gray-600">{order.customerPhone}</div>
                              </div>
                              <div>
                                <div className="font-medium text-gray-700 mb-1">Itens</div>
                                {order.items.map((item) => (
                                  <div key={item.id} className="text-gray-600">
                                    {item.product.name} x{item.quantity} - R$ {(Number(item.price) * item.quantity).toFixed(2)}
                                  </div>
                                ))}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>R$ {subtotal.toFixed(2)}</span>
                                  </div>
                                  {shipping > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                      <span>Frete:</span>
                                      <span>R$ {shipping.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-medium text-gray-900 mt-1">
                                    <span>Total:</span>
                                    <span>R$ {total.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {orderType === "delivery" && order.address && (
                              <div className="border-t border-gray-200 pt-3">
                                <div className="font-medium text-gray-700 mb-1 text-xs">Endereço de Entrega</div>
                                <div className="text-xs text-gray-600">
                                  {order.address.street}, {order.address.number}
                                  {order.address.complement && `, ${order.address.complement}`}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {order.address.neighborhood}, {order.address.city} - {order.address.zipCode}
                                </div>
                                {order.deliveryTime && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Horário: {order.deliveryTime === "MANHA" ? "Manhã (9h-12h)" : "Tarde (14h-18h)"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
