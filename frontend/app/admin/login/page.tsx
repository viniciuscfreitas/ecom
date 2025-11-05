"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import api from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", response.data.token);
      router.push("/admin/pedidos");
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-gray-900">Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

