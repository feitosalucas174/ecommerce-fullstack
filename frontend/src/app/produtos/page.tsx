"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProdutoCard } from "@/components/produto/ProdutoCard";
import { Product, CATEGORY_LABELS, Category } from "@/types";
import api from "@/services/api";
import toast from "react-hot-toast";

const CATEGORIES: [string, string][] = [
  ["", "Todas"],
  ...Object.entries(CATEGORY_LABELS),
];

function ProdutosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("busca") ?? "");
  const [category, setCategory] = useState(searchParams.get("categoria") ?? "");

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    api.get(`/products/?${params}`)
      .then((r) => setProducts(r.data.results ?? r.data))
      .catch(() => toast.error("Erro ao carregar produtos"))
      .finally(() => setIsLoading(false));
  }, [search, category]);

  const updateURL = (newSearch: string, newCat: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("busca", newSearch);
    if (newCat) params.set("categoria", newCat);
    router.replace(`/produtos?${params}`);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Page header */}
        <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Produtos</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {!isLoading && `${products.length} produto(s) encontrado(s)`}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); updateURL(e.target.value, category); }}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2.5 pl-9 pr-4 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 transition-colors"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => { setCategory(value); updateURL(search, value); }}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                    category === value
                      ? "bg-gray-900 dark:bg-blue-600 text-white shadow-md"
                      : "border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 text-5xl">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tente outros termos ou remova os filtros.</p>
              <button
                onClick={() => { setSearch(""); setCategory(""); updateURL("", ""); }}
                className="mt-6 rounded-xl bg-gray-900 dark:bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p, i) => (
                <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}>
                  <ProdutoCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense>
      <ProdutosContent />
    </Suspense>
  );
}
