"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCart, clearCart, CartItem } from "@/lib/cart";
import api from "@/lib/api";

export default function Checkout() {
  const router = useRouter();
  const [cart] = useState<CartItem[]>(getCart());
  const [loading, setLoading] = useState(false);
  const [shippingValue, setShippingValue] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    zipCode: "",
    deliveryTime: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        address: {
          street: formData.street,
          number: formData.number,
          complement: formData.complement || undefined,
          neighborhood: formData.neighborhood,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingValue: shippingValue || undefined,
        deliveryTime: formData.deliveryTime || undefined,
      };

      const response = await api.post("/orders", orderData);
      router.push(`/pagamento/${response.data.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Erro ao criar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateShipping = useCallback(async (zipCode: string) => {
    if (!zipCode || zipCode.length < 8) {
      setShippingValue(null);
      return;
    }

    setLoadingShipping(true);
    try {
      const response = await api.get(`/shipping/calculate?zipCode=${zipCode}`);
      setShippingValue(response.data.value);
    } catch (error) {
      console.error("Error calculating shipping:", error);
      setShippingValue(null);
    } finally {
      setLoadingShipping(false);
    }
  }, []);

  useEffect(() => {
    if (formData.zipCode && formData.zipCode.length >= 8) {
      const timeoutId = setTimeout(() => {
        calculateShipping(formData.zipCode);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setShippingValue(null);
    }
  }, [formData.zipCode, calculateShipping]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    return subtotal + (shippingValue || 0);
  }, [subtotal, shippingValue]);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
        <a href="/" className="text-blue-600 hover:underline">
          Continuar comprando
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Dados Pessoais</h2>
          <div className="space-y-4">
            <input
              type="text"
              name="customerName"
              placeholder="Nome completo"
              required
              value={formData.customerName}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            />
            <input
              type="email"
              name="customerEmail"
              placeholder="Email"
              required
              value={formData.customerEmail}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            />
            <input
              type="tel"
              name="customerPhone"
              placeholder="Telefone"
              required
              value={formData.customerPhone}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
          <div className="space-y-4">
            <input
              type="text"
              name="street"
              placeholder="Rua"
              required
              value={formData.street}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="number"
                placeholder="Número"
                required
                value={formData.number}
                onChange={handleChange}
                className="border rounded px-4 py-2"
              />
              <input
                type="text"
                name="complement"
                placeholder="Complemento"
                value={formData.complement}
                onChange={handleChange}
                className="border rounded px-4 py-2"
              />
            </div>
            <input
              type="text"
              name="neighborhood"
              placeholder="Bairro"
              required
              value={formData.neighborhood}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="Cidade"
                required
                value={formData.city}
                onChange={handleChange}
                className="border rounded px-4 py-2"
              />
              <input
                type="text"
                name="zipCode"
                placeholder="CEP"
                required
                value={formData.zipCode}
                onChange={handleChange}
                className="border rounded px-4 py-2"
              />
            </div>
            {loadingShipping && (
              <p className="text-sm text-gray-600">Calculando frete...</p>
            )}
            {shippingValue !== null && !loadingShipping && (
              <p className="text-sm font-semibold text-green-600">
                Frete: R$ {shippingValue.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Horário de Entrega</h2>
          <select
            name="deliveryTime"
            value={formData.deliveryTime}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          >
            <option value="">Selecione um horário</option>
            <option value="MANHA">Manhã (9h - 12h)</option>
            <option value="TARDE">Tarde (14h - 18h)</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Subtotal:</span>
            <span className="text-lg font-semibold">
              R$ {subtotal.toFixed(2)}
            </span>
          </div>
          {shippingValue !== null && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Frete:</span>
              <span className="text-lg font-semibold">R$ {shippingValue.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-2xl font-bold text-green-600">
              R$ {total.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? "Processando..." : "Finalizar Pedido"}
        </button>
      </form>
    </div>
  );
}

