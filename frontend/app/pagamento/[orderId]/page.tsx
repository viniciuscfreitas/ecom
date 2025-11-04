"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { clearCart } from "@/lib/cart";

interface PaymentData {
  id: string;
  status: string;
  qrCode?: string;
  pixKey?: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [paymentCreated, setPaymentCreated] = useState(false);

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/orders/${orderId}/payment`);
      return response.data;
    },
    onSuccess: () => {
      setPaymentCreated(true);
    },
  });

  const { data: payment, refetch: refetchPayment } = useQuery<PaymentData>({
    queryKey: ["payment", orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}/payment`);
      return response.data;
    },
    enabled: paymentCreated,
  });

  useEffect(() => {
    if (!paymentCreated && orderId) {
      createPaymentMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (payment?.status === "paid") {
      clearCart();
      setTimeout(() => {
        router.push(`/pedido/${orderId}`);
      }, 2000);
    }
  }, [payment?.status, orderId, router]);

  if (createPaymentMutation.isPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Criando pagamento...</div>
      </div>
    );
  }

  if (createPaymentMutation.isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Erro ao criar pagamento</h1>
        <p className="text-red-600 mb-4">
          {createPaymentMutation.error instanceof Error
            ? createPaymentMutation.error.message
            : "Erro ao criar pagamento. Tente novamente."}
        </p>
        <button
          onClick={() => createPaymentMutation.mutate()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    pending: "Aguardando Pagamento",
    paid: "Pagamento Confirmado",
    expired: "Pagamento Expirado",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Pagamento PIX</h1>

      <div className="mb-6">
        <p className="text-lg font-semibold mb-2">
          Status: {statusLabels[payment.status] || payment.status}
        </p>
      </div>

      {payment.status === "pending" && (
        <>
          {payment.qrCode && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Escaneie o QR Code</h2>
              <div className="bg-white p-4 rounded border flex justify-center">
                {payment.qrCode.startsWith('data:image') ? (
                  <img
                    src={payment.qrCode}
                    alt="QR Code PIX"
                    className="max-w-xs"
                  />
                ) : (
                  <img
                    src={`data:image/png;base64,${payment.qrCode}`}
                    alt="QR Code PIX"
                    className="max-w-xs"
                  />
                )}
              </div>
            </div>
          )}

          {payment.pixKey && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Ou copie e cole a chave PIX</h2>
              <div className="bg-gray-100 p-4 rounded border">
                <p className="font-mono text-sm break-all">{payment.pixKey}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(payment.pixKey!);
                    alert("Chave PIX copiada!");
                  }}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Copiar Chave PIX
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-sm text-blue-800">
              Após realizar o pagamento, aguarde a confirmação. Você será redirecionado automaticamente.
            </p>
          </div>

          <button
            onClick={() => refetchPayment()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Verificar Pagamento
          </button>
        </>
      )}

      {payment.status === "paid" && (
        <div className="bg-green-50 border border-green-200 rounded p-6">
          <p className="text-lg font-semibold text-green-800 mb-4">
            Pagamento confirmado! Redirecionando...
          </p>
        </div>
      )}

      {payment.status === "expired" && (
        <div className="bg-red-50 border border-red-200 rounded p-6">
          <p className="text-lg font-semibold text-red-800 mb-4">
            Pagamento expirado
          </p>
          <button
            onClick={() => {
              setPaymentCreated(false);
              createPaymentMutation.mutate();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Gerar Novo Pagamento
          </button>
        </div>
      )}
    </div>
  );
}

