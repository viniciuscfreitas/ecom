"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/useAdminAuth";
import type { Product } from "@/lib/types";

export default function AdminProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/products");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await adminApi.post("/admin/products", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await adminApi.patch(`/admin/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.delete(`/admin/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      description: "",
      imageUrl: "",
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || "",
      imageUrl: product.imageUrl || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja deletar o produto "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/admin/pedidos")}
            className="text-blue-600 hover:text-blue-800"
          >
            Pedidos
          </button>
          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Adicionar Produto
            </button>
          )}
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              router.push("/admin/login");
            }}
            className="text-red-600 hover:text-red-800"
          >
            Sair
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-4 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preço *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estoque *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded px-4 py-2"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL da Imagem</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full border rounded px-4 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvando..."
                  : editingProduct
                  ? "Atualizar"
                  : "Criar"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {products?.map((product) => (
          <div key={product.id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-gray-600 mb-2">{product.description}</p>
                )}
                <div className="flex gap-4 text-sm">
                  <span className="font-semibold">Preço: R$ {Number(product.price).toFixed(2)}</span>
                  <span className="font-semibold">Estoque: {product.stock}</span>
                </div>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-300"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

