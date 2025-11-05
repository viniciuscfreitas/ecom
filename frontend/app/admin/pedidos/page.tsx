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
      toast.error("Erro ao atualizar");
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
    return (
      <div className="text-sm text-gray-600">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">Pedidos</h1>
        <div className="text-sm text-gray-600">
          {filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"}
        </div>
      </div>

      <div className="mb-4 flex gap-4 border-b border-gray-300 pb-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as OrderType)}
            className="px-2 py-1 text-sm border border-gray-300 bg-white"
          >
            <option value="all">Todos</option>
            <option value="delivery">Delivery</option>
            <option value="ecommerce">E-commerce</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-2 py-1 text-sm border border-gray-300 bg-white"
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
        <div className="text-sm text-gray-600 py-8 text-center">Nenhum pedido encontrado</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left p-2 font-medium text-gray-900">ID</th>
                <th className="text-left p-2 font-medium text-gray-900">Cliente</th>
                <th className="text-left p-2 font-medium text-gray-900">Tipo</th>
                <th className="text-left p-2 font-medium text-gray-900">Status</th>
                <th className="text-left p-2 font-medium text-gray-900">Pagamento</th>
                <th className="text-right p-2 font-medium text-gray-900">Total</th>
                <th className="text-left p-2 font-medium text-gray-900">Data</th>
                <th className="text-center p-2 font-medium text-gray-900">Ações</th>
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
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <td className="p-2 font-mono text-xs text-gray-700">{order.id.slice(0, 8)}</td>
                      <td className="p-2">
                        <div>{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="p-2">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs ${
                            orderType === "delivery"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {orderType === "delivery" ? "DEL" : "ECO"}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="text-xs">{ORDER_STATUS_LABELS[order.status] || order.status}</span>
                      </td>
                      <td className="p-2">
                        {order.paymentStatus && (
                          <span
                            className={`text-xs ${
                              order.paymentStatus === "paid" ? "text-green-600" : "text-gray-600"
                            }`}
                          >
                            {order.paymentStatus === "paid" ? "Pago" : order.paymentStatus === "pending" ? "Pendente" : "Expirado"}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right font-mono text-xs">R$ {total.toFixed(2)}</td>
                      <td className="p-2 text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-2 text-center">
                        {canUpdateStatus && nextStatus && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, order.status);
                            }}
                            disabled={updateStatusMutation.isPending}
                            className="px-2 py-1 text-xs bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                          >
                            {updateStatusMutation.isPending ? "..." : "→"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-4 bg-gray-50 border-b border-gray-300">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="font-medium text-gray-900 mb-2">Itens</div>
                              <div className="space-y-1">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between">
                                    <span>
                                      {item.product.name} x {item.quantity}
                                    </span>
                                    <span className="font-mono">R$ {(Number(item.price) * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-300">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
                                </div>
                                {shipping > 0 && (
                                  <div className="flex justify-between">
                                    <span>Frete:</span>
                                    <span className="font-mono">R$ {shipping.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium mt-1">
                                  <span>Total:</span>
                                  <span className="font-mono">R$ {total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 mb-2">Contato</div>
                              <div className="space-y-1 text-gray-600">
                                <div>Telefone: {order.customerPhone}</div>
                              </div>
                              {orderType === "delivery" && order.address && (
                                <>
                                  <div className="font-medium text-gray-900 mt-3 mb-2">Endereço</div>
                                  <div className="space-y-1 text-gray-600">
                                    <div>
                                      {order.address.street}, {order.address.number}
                                      {order.address.complement && `, ${order.address.complement}`}
                                    </div>
                                    <div>
                                      {order.address.neighborhood}, {order.address.city} - {order.address.zipCode}
                                    </div>
                                    {order.deliveryTime && (
                                      <div className="mt-2">
                                        Horário: {order.deliveryTime === "MANHA" ? "Manhã (9h-12h)" : "Tarde (14h-18h)"}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
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
