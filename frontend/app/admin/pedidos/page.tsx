"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Filter } from "lucide-react";
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
      toast.success("Status do pedido atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status do pedido");
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
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-96 mb-4" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2 min-w-[200px]">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as OrderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 min-w-[200px]">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDENTE">{ORDER_STATUS_LABELS.PENDENTE}</SelectItem>
                  <SelectItem value="PREPARANDO">{ORDER_STATUS_LABELS.PREPARANDO}</SelectItem>
                  <SelectItem value="SAIU_PARA_ENTREGA">{ORDER_STATUS_LABELS.SAIU_PARA_ENTREGA}</SelectItem>
                  <SelectItem value="ENTREGUE">{ORDER_STATUS_LABELS.ENTREGUE}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum pedido encontrado com os filtros selecionados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                        <Badge
                          variant={orderType === "delivery" ? "default" : "secondary"}
                          className={orderType === "delivery" ? "bg-blue-600" : "bg-green-600"}
                        >
                          {orderType === "delivery" ? "DELIVERY" : "ECOMMERCE"}
                        </Badge>
                        <Badge variant="outline">
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </Badge>
                        {order.paymentStatus && (
                          <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                            {order.paymentStatus === "paid" ? "Pago" : order.paymentStatus === "pending" ? "Pendente" : "Expirado"}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">Cliente:</span> {order.customerName}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Email:</span> {order.customerEmail}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Telefone:</span> {order.customerPhone}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Data:</span>{" "}
                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">R$ {total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Itens do Pedido</h4>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} <span className="text-muted-foreground">x {item.quantity}</span>
                          </span>
                          <span className="font-medium">
                            R$ {(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {shipping > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Frete:</span>
                          <span>R$ {shipping.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {orderType === "delivery" && order.address && (
                    <div className="rounded-lg bg-muted p-3">
                      <h4 className="font-semibold mb-2 text-sm">Endereço de Entrega</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          {order.address.street}, {order.address.number}
                          {order.address.complement && `, ${order.address.complement}`}
                        </p>
                        <p>
                          {order.address.neighborhood}, {order.address.city} - {order.address.zipCode}
                        </p>
                        {order.deliveryTime && (
                          <p className="mt-2 font-medium">
                            Horário: {order.deliveryTime === "MANHA" ? "Manhã (9h-12h)" : "Tarde (14h-18h)"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {canUpdateStatus && nextStatus && (
                    <Button
                      onClick={() => handleStatusUpdate(order.id, order.status)}
                      disabled={updateStatusMutation.isPending}
                      className="w-full"
                    >
                      {updateStatusMutation.isPending ? (
                        "Atualizando..."
                      ) : (
                        <>
                          Marcar como {ORDER_STATUS_LABELS[nextStatus]}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

