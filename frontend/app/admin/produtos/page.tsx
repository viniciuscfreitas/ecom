"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { toast } from "sonner";
import type { Product, ProductCreateData, ProductUpdateData } from "@/lib/types";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [newProduct, setNewProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
    category: "",
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await adminApi.get("/admin/products");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const categories = useMemo(() => {
    if (!products) return [];
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (categoryFilter === "all") return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const createMutation = useMutation({
    mutationFn: async (data: ProductCreateData) => {
      const response = await adminApi.post("/admin/products", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      resetForm();
      toast.success("Criado");
    },
    onError: () => {
      toast.error("Erro");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductUpdateData }) => {
      const response = await adminApi.patch(`/admin/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      resetForm();
      toast.success("Atualizado");
    },
    onError: () => {
      toast.error("Erro");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.delete(`/admin/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Deletado");
    },
    onError: () => {
      toast.error("Erro");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      description: "",
      imageUrl: "",
      category: "",
    });
    setEditingId(null);
    setNewProduct(false);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      category: product.category || "",
    });
  };

  const handleSave = async (id: string | null) => {
    const data = {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      category: formData.category || undefined,
    };

    if (id) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deletar "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <div className="text-sm text-gray-600">Carregando...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">Produtos</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}
          </div>
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 bg-white"
            >
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
          {!newProduct && (
            <button
              onClick={() => {
                resetForm();
                setNewProduct(true);
              }}
              className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-800"
            >
              + Novo
            </button>
          )}
        </div>
      </div>

      {newProduct && (
        <div className="mb-4 border border-gray-300 bg-gray-50 p-3">
          <div className="grid grid-cols-12 gap-2 text-sm">
            <div className="col-span-4">
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 bg-white"
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Categoria"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 bg-white"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                step="0.01"
                placeholder="Preço"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 bg-white"
              />
            </div>
            <div className="col-span-1">
              <input
                type="number"
                placeholder="Estoque"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 bg-white"
              />
            </div>
            <div className="col-span-2">
              <input
                type="url"
                placeholder="URL imagem"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 bg-white"
              />
            </div>
            <div className="col-span-1 flex gap-1">
              <button
                onClick={() => handleSave(null)}
                disabled={createMutation.isPending || !formData.name || !formData.price || !formData.stock}
                className="px-2 py-1 text-xs bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {createMutation.isPending ? "..." : "Salvar"}
              </button>
              <button
                onClick={resetForm}
                className="px-2 py-1 text-xs border border-gray-300 bg-white hover:bg-gray-50"
              >
                ×
              </button>
            </div>
          </div>
          <div className="mt-2">
            <textarea
              placeholder="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 text-sm border border-gray-300 bg-white"
            />
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-sm text-gray-600 py-8 text-center">Nenhum produto encontrado</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left p-2 font-medium text-gray-900">Nome</th>
                <th className="text-left p-2 font-medium text-gray-900">Categoria</th>
                <th className="text-right p-2 font-medium text-gray-900">Preço</th>
                <th className="text-right p-2 font-medium text-gray-900">Estoque</th>
                <th className="text-left p-2 font-medium text-gray-900">Imagem</th>
                <th className="text-center p-2 font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isEditing = editingId === product.id;

                if (isEditing) {
                  return (
                    <tr key={product.id} className="border-b border-gray-200 bg-gray-50">
                      <td className="p-2" colSpan={6}>
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 bg-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 bg-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 bg-white"
                            />
                          </div>
                          <div className="col-span-1">
                            <input
                              type="number"
                              value={formData.stock}
                              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 bg-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="url"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 bg-white"
                            />
                          </div>
                          <div className="col-span-1 flex gap-1">
                            <button
                              onClick={() => handleSave(product.id)}
                              disabled={updateMutation.isPending || !formData.name || !formData.price || !formData.stock}
                              className="px-2 py-1 text-xs bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              {updateMutation.isPending ? "..." : "Salvar"}
                            </button>
                            <button
                              onClick={resetForm}
                              className="px-2 py-1 text-xs border border-gray-300 bg-white hover:bg-gray-50"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 bg-white"
                            placeholder="Descrição"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-2">{product.name}</td>
                    <td className="p-2 text-gray-600">{product.category || "-"}</td>
                    <td className="p-2 text-right font-mono text-xs">R$ {Number(product.price).toFixed(2)}</td>
                    <td className="p-2 text-right font-mono text-xs">{product.stock}</td>
                    <td className="p-2">
                      {product.imageUrl ? (
                        <span className="text-xs text-gray-500 truncate max-w-xs block">{product.imageUrl}</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => startEdit(product)}
                          className="px-2 py-1 text-xs border border-gray-300 bg-white hover:bg-gray-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleteMutation.isPending}
                          className="px-2 py-1 text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? "..." : "×"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
