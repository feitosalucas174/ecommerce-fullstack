"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProdutoCard } from "@/components/produto/ProdutoCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "electronics", label: "Eletrônicos", emoji: "💻" },
  { value: "clothing", label: "Vestuário", emoji: "👕" },
  { value: "books", label: "Livros", emoji: "📚" },
  { value: "home", label: "Casa", emoji: "🏠" },
  { value: "sports", label: "Esportes", emoji: "⚽" },
  { value: "beauty", label: "Beleza", emoji: "💄" },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const { login, user } = useAuth();

  useEffect(() => {
    api.get("/products/?ordering=-created_at&page_size=8")
      .then((r) => setProducts(r.data.results ?? r.data))
      .catch(() => toast.error("Erro ao carregar produtos"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
      setLoginOpen(false);
      toast.success("Bem-vindo de volta!");
    } catch {
      toast.error("Usuário ou senha inválidos.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-blue-700 to-blue-500 py-20 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl">
              Bem-vindo à <span className="text-yellow-300">ShopFull</span>
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Encontre os melhores produtos com os melhores preços
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/produtos"
                className="rounded-xl bg-white px-8 py-3 font-semibold text-blue-700 hover:bg-blue-50"
              >
                Ver todos os produtos
              </Link>
              {!user && (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="rounded-xl border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Fazer login
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Categorias</h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/produtos?categoria=${cat.value}`}
                className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center shadow-sm hover:border-blue-300 hover:shadow-md"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Produtos em Destaque</h2>
            <Link href="/produtos" className="text-sm text-blue-600 hover:underline">
              Ver todos →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((p) => (
                <ProdutoCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />

      {/* Login Modal */}
      <Modal isOpen={loginOpen} onClose={() => setLoginOpen(false)} title="Entrar na conta">
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Usuário"
            value={loginForm.username}
            onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
            placeholder="admin"
            required
          />
          <Input
            label="Senha"
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="••••••"
            required
          />
          <Button type="submit" isLoading={loginLoading} className="w-full">
            Entrar
          </Button>
          <p className="text-center text-xs text-gray-500">
            Demo: <strong>admin@email.com</strong> / <strong>admin123</strong>
          </p>
        </form>
      </Modal>
    </>
  );
}
