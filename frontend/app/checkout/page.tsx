"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, clearCart, CartItem } from "@/lib/cart";
import api from "@/lib/api";

export default function Checkout() {
  const router = useRouter();
  const [cart] = useState<CartItem[]>(getCart());
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

