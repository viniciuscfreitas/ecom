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
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="text-left p-2 font-medium text-gray-900">ID</th>
                <th className="text-left p-2 font-medium text-gray-900">Cliente / Contato</th>
                <th className="text-left p-2 font-medium text-gray-900">Tipo</th>
                <th className="text-left p-2 font-medium text-gray-900">Status</th>
                <th className="text-left p-2 font-medium text-gray-900">Pagamento</th>
                <th className="text-left p-2 font-medium text-gray-900">Itens</th>
                <th className="text-left p-2 font-medium text-gray-900">Endereço</th>
                <th className="text-right p-2 font-medium text-gray-900">Valores</th>
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
                const itemsSummary = order.items.map(i => `${i.product.name} x${i.quantity}`).join(", ");
                const addressSummary = order.address 
                  ? `${order.address.street}, ${order.address.number}${order.address.complement ? `, ${order.address.complement}` : ""} - ${order.address.neighborhood}`
                  : "-";

                return (
                  <>
                    <tr
                      key={order.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${isExpanded ? "bg-gray-50" : ""}`}
                    >
                      <td className="p-2 font-mono text-gray-700">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="text-left hover:underline"
                        >
                          {order.id.slice(0, 8)}
                          <span className="ml-1 text-gray-400">{isExpanded ? "▼" : "▶"}</span>
                        </button>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-gray-600">{order.customerEmail}</div>
                        <div className="text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="p-2">
                        <span
                          className={`inline-block px-2 py-0.5 ${
                            orderType === "delivery"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {orderType === "delivery" ? "DEL" : "ECO"}
                        </span>
                        {order.deliveryTime && (
                          <div className="mt-1 text-gray-600">
                            {order.deliveryTime === "MANHA" ? "Manhã" : "Tarde"}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{ORDER_STATUS_LABELS[order.status] || order.status}</span>
                      </td>
                      <td className="p-2">
                        {order.paymentStatus ? (
                          <span
                            className={`font-medium ${
                              order.paymentStatus === "paid" ? "text-green-600" : order.paymentStatus === "pending" ? "text-orange-600" : "text-red-600"
                            }`}
                          >
                            {order.paymentStatus === "paid" ? "Pago" : order.paymentStatus === "pending" ? "Pendente" : "Expirado"}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2 text-gray-700 max-w-sm">
                        <div className="text-xs">{itemsSummary}</div>
                        <div className="text-gray-500 mt-1 text-xs">{order.items.length} {order.items.length === 1 ? "item" : "itens"}</div>
                      </td>
                      <td className="p-2 text-gray-700 max-w-sm">
                        {order.address ? (
                          <div className="text-xs">{addressSummary}</div>
                        ) : (
                          <span className="text-gray-400 text-xs">Retirada</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        <div className="font-mono font-medium">R$ {total.toFixed(2)}</div>
                        <div className="text-gray-500 text-xs">
                          {shipping > 0 && `+ R$ ${shipping.toFixed(2)} frete`}
                        </div>
                        <div className="text-gray-500 text-xs">Sub: R$ {subtotal.toFixed(2)}</div>
                      </td>
                      <td className="p-2 text-gray-600">
                        <div>{new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}</div>
                        <div className="text-xs">
                          {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {canUpdateStatus && nextStatus && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, order.status);
                            }}
                            disabled={updateStatusMutation.isPending}
                            className="px-2 py-1 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 text-xs"
                            title={`Marcar como ${ORDER_STATUS_LABELS[nextStatus]}`}
                          >
                            {updateStatusMutation.isPending ? "..." : "→"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className="p-4 bg-gray-50 border-b border-gray-300">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <div className="font-medium text-gray-900 mb-2 pb-1 border-b border-gray-300">Itens do Pedido</div>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between">
                                    <span className="text-gray-700">
                                      {item.product.name} <span className="text-gray-500">x {item.quantity}</span>
                                    </span>
                                    <span className="font-mono text-gray-900">R$ {(Number(item.price) * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-2 border-t border-gray-300 space-y-1">
                                <div className="flex justify-between text-gray-600">
                                  <span>Subtotal:</span>
                                  <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
                                </div>
                                {shipping > 0 && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Frete:</span>
                                    <span className="font-mono">R$ {shipping.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium text-gray-900 pt-1 border-t border-gray-300">
                                  <span>Total:</span>
                                  <span className="font-mono">R$ {total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 mb-2 pb-1 border-b border-gray-300">Informações de Contato</div>
                              <div className="space-y-2 text-gray-700">
                                <div>
                                  <span className="text-gray-500">Nome:</span> {order.customerName}
                                </div>
                                <div>
                                  <span className="text-gray-500">Email:</span> {order.customerEmail}
                                </div>
                                <div>
                                  <span className="text-gray-500">Telefone:</span> {order.customerPhone}
                                </div>
                                {order.paymentId && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <span className="text-gray-500">Payment ID:</span>
                                    <div className="font-mono text-xs text-gray-600 break-all">{order.paymentId}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              {orderType === "delivery" && order.address ? (
                                <>
                                  <div className="font-medium text-gray-900 mb-2 pb-1 border-b border-gray-300">Endereço de Entrega</div>
                                  <div className="space-y-1 text-gray-700">
                                    <div>
                                      <span className="text-gray-500">Rua:</span> {order.address.street}, {order.address.number}
                                      {order.address.complement && `, ${order.address.complement}`}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Bairro:</span> {order.address.neighborhood}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Cidade:</span> {order.address.city} - {order.address.zipCode}
                                    </div>
                                    {order.deliveryTime && (
                                      <div className="mt-2 pt-2 border-t border-gray-300">
                                        <span className="text-gray-500">Horário:</span> {order.deliveryTime === "MANHA" ? "Manhã (9h-12h)" : "Tarde (14h-18h)"}
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="font-medium text-gray-900 mb-2 pb-1 border-b border-gray-300">Tipo de Pedido</div>
                                  <div className="text-gray-700">
                                    Retirada na loja
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
