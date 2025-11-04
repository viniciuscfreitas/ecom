"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

export default function OrderConfirmation() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Pedido não encontrado</div>
        <Link href="/" className="text-blue-600 hover:underline">
          Voltar para home
        </Link>
      </div>
    );
  }

  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Pedido Confirmado!</h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold mb-2">Pedido #{order.id.slice(0, 8)}</p>
        <p className="text-gray-600">Status: {ORDER_STATUS_LABELS[order.status] || order.status}</p>
        {order.paymentStatus && (
          <p className="text-gray-600 mt-2">
            Pagamento: {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
          </p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Itens do Pedido</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>R$ {(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-green-600">R$ {total.toFixed(2)}</span>
        </div>
      </div>

      {order.address && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
          <p className="text-gray-600">
            {order.address.street}, {order.address.number}
            {order.address.complement && `, ${order.address.complement}`}
          </p>
          <p className="text-gray-600">
            {order.address.neighborhood}, {order.address.city} - {order.address.zipCode}
          </p>
        </div>
      )}

      <Link
        href="/"
        className="block text-center bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
      >
        Continuar Comprando
      </Link>
    </div>
  );
}

