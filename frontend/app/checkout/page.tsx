"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { useCart } from "@/lib/useCart";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { InsufficientStockDetail } from "@/lib/types";

export default function Checkout() {
  const router = useRouter();
  const { items: cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingValue, setShippingValue] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
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
      const axiosError = error as AxiosError<{ error?: string; details?: InsufficientStockDetail[] }>;
      
      if (axiosError.response?.status === 400 && axiosError.response?.data?.error === "Insufficient stock") {
        const details = axiosError.response.data.details || [];
        const productsList = details.map((d) => 
          `- ${d.productName}: disponível ${d.available}, solicitado ${d.requested}`
        ).join("\n");
        toast.error(`Estoque insuficiente para alguns produtos:\n\n${productsList}\n\nPor favor, ajuste as quantidades e tente novamente.`);
      } else {
        toast.error("Erro ao criar pedido. Tente novamente.");
      }
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

  const isValidCEP = (cep: string): boolean => {
    const digitsOnly = cep.replace(/\D/g, '');
    return digitsOnly.length === 8;
  };

  useEffect(() => {
    if (!formData.zipCode) {
      setShippingValue(null);
      setCepError(null);
      return;
    }

    if (!isValidCEP(formData.zipCode)) {
      setShippingValue(null);
      setCepError("CEP deve ter 8 dígitos");
      return;
    }

    setCepError(null);
    const timeoutId = setTimeout(async () => {
      setLoadingShipping(true);
      try {
        const digitsOnly = formData.zipCode.replace(/\D/g, '');
        const response = await api.get(`/shipping/calculate?zipCode=${digitsOnly}`);
        setShippingValue(response.data.value);
      } catch (error) {
        console.error("Error calculating shipping:", error);
        setShippingValue(null);
      } finally {
        setLoadingShipping(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.zipCode]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (shippingValue || 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
        <Button asChild>
          <Link href="/">Continuar comprando</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome completo</Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Nome completo"
                required
                value={formData.customerName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                name="customerEmail"
                placeholder="Email"
                required
                value={formData.customerEmail}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefone</Label>
              <Input
                id="customerPhone"
                type="tel"
                name="customerPhone"
                placeholder="Telefone"
                required
                value={formData.customerPhone}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                name="street"
                placeholder="Rua"
                required
                value={formData.street}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  name="number"
                  placeholder="Número"
                  required
                  value={formData.number}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  name="complement"
                  placeholder="Complemento"
                  value={formData.complement}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                placeholder="Bairro"
                required
                value={formData.neighborhood}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Cidade"
                  required
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="CEP"
                  required
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </div>
            </div>
            {loadingShipping && (
              <p className="text-sm text-muted-foreground">Calculando frete...</p>
            )}
            {cepError && (
              <p className="text-sm text-destructive">{cepError}</p>
            )}
            {shippingValue !== null && !loadingShipping && !cepError && (
              <p className="text-sm font-semibold text-primary">
                Frete: R$ {shippingValue.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horário de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              name="deliveryTime"
              value={formData.deliveryTime}
              onValueChange={(value) => setFormData({ ...formData, deliveryTime: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANHA">Manhã (9h - 12h)</SelectItem>
                <SelectItem value="TARDE">Tarde (14h - 18h)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-semibold text-foreground">R$ {subtotal.toFixed(2)}</span>
            </div>
            {shippingValue !== null && (
              <div className="flex justify-between text-muted-foreground">
                <span>Frete:</span>
                <span className="font-semibold text-foreground">R$ {shippingValue.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? "Processando..." : "Finalizar Pedido"}
        </Button>
      </form>
    </div>
  );
}

