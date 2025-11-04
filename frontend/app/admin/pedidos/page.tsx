"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LogOut, Package, ArrowRight } from "lucide-react";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

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

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/produtos")}>
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              localStorage.removeItem("adminToken");
              router.push("/admin/login");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => {
          const subtotal = order.items.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0
          );
          const shipping = order.shippingValue ? Number(order.shippingValue) : 0;
          const total = subtotal + shipping;
          const canUpdateStatus = order.status !== "ENTREGUE";

          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Pedido #{order.id.slice(0, 8)}</CardTitle>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>{order.customerName}</p>
                      <p>{order.customerEmail}</p>
                      <p>{order.customerPhone}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant="default">
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                    {order.paymentStatus && (
                      <div className="text-sm">
                        <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                          {order.paymentStatus === "paid" ? "Pago" : order.paymentStatus === "pending" ? "Pendente" : "Expirado"}
                        </Badge>
                      </div>
                    )}
                    {order.deliveryTime && (
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryTime === "MANHA" ? "Manhã (9h-12h)" : "Tarde (14h-18h)"}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">Itens:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm">
                        {item.product.name} x {item.quantity} - R${" "}
                        {(Number(item.price) * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
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

                {order.address && (
                  <div>
                    <p className="font-semibold mb-2">Endereço:</p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.street}, {order.address.number}
                      {order.address.complement && `, ${order.address.complement}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.neighborhood}, {order.address.city} - {order.address.zipCode}
                    </p>
                  </div>
                )}

                {canUpdateStatus && (
                  <Button
                    onClick={() => handleStatusUpdate(order.id, order.status)}
                    disabled={updateStatusMutation.isPending}
                    className="w-full"
                  >
                    {updateStatusMutation.isPending ? (
                      "Atualizando..."
                    ) : (
                      <>
                        Atualizar para: {ORDER_STATUS_LABELS[statusOrder[statusOrder.indexOf(order.status) + 1]]}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

