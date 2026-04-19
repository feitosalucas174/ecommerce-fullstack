"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProdutoCard } from "@/components/produto/ProdutoCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Product, CATEGORY_LABELS, Category } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import toast from "react-hot-toast";

const CATEGORIES: { value: Category; emoji: string }[] = [
  { value: "electronics", emoji: "💻" },
  { value: "clothing",    emoji: "👕" },
  { value: "books",       emoji: "📚" },
  { value: "home",        emoji: "🏠" },
  { value: "sports",      emoji: "⚽" },
  { value: "beauty",      emoji: "✨" },
];

const PERKS = [
  { icon: "🚀", title: "Entrega expressa",  desc: "Em até 2 dias úteis" },
  { icon: "🔒", title: "Pagamento seguro",  desc: "Seus dados protegidos" },
  { icon: "↩️", title: "Troca fácil",        desc: "30 dias sem perguntas" },
  { icon: "🎧", title: "Suporte 24/7",       desc: "Sempre disponível" },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const { login, user } = useAuth();

  useEffect(() => {
    api.get("/products/?ordering=-created_at")
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
      <main className="min-h-screen">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-hero-gradient">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <span className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-blue-200 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse-slow" />
                Mais de 200 produtos disponíveis
              </span>

              {/* Title */}
              <h1 className="animate-fade-up animation-delay-100 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Tudo que você
                <br />
                <span className="text-gradient">precisa, aqui.</span>
              </h1>

              <p className="animate-fade-up animation-delay-200 mt-6 max-w-xl text-lg text-gray-300 leading-relaxed">
                Eletrônicos, moda, casa e muito mais com os melhores preços e
                entrega rápida para todo o Brasil.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up animation-delay-300 mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Link
                  href="/produtos"
                  className="shine-on-hover inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg hover:bg-blue-500 transition-colors"
                >
                  Explorar produtos
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {!user && (
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="inline-flex items-center rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Fazer login
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Perks bar ─────────────────────────────────────── */}
        <section className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
              {PERKS.map((p) => (
                <div key={p.title} className="flex items-center gap-3 px-6 py-5">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Navegue por</p>
              <h2 className="mt-1 text-2xl font-black text-gray-900">Categorias</h2>
            </div>
            <Link href="/produtos" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/produtos?categoria=${cat.value}`}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                  {cat.emoji}
                </span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  {CATEGORY_LABELS[cat.value]}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured products ─────────────────────────────── */}
        <section className="bg-gray-50/50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Selecionados</p>
                <h2 className="mt-1 text-2xl font-black text-gray-900">Produtos em Destaque</h2>
              </div>
              <Link href="/produtos" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                Ver todos
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.slice(0, 8).map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <ProdutoCard product={p} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                href="/produtos"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300 hover:shadow-md transition-all"
              >
                Ver todos os produtos
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Banner CTA ────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-blue-950 px-8 py-14 text-center sm:px-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">Oferta especial</p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Frete grátis em todos<br />os pedidos do mês
              </h2>
              <p className="mt-4 text-gray-300">
                Sem valor mínimo. Aproveite enquanto dura!
              </p>
              <Link
                href="/produtos"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Comprar agora
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {/* ── Login Modal ───────────────────────────────────── */}
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
          <div className="rounded-xl bg-blue-50 p-3 text-center text-xs text-gray-600">
            Demo: <span className="font-semibold text-gray-800">admin</span> / <span className="font-semibold text-gray-800">admin123</span>
          </div>
        </form>
      </Modal>
    </>
  );
}
