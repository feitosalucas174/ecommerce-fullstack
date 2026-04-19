"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProdutoCard } from "@/components/produto/ProdutoCard";
import { Input } from "@/components/ui/Input";
import { Product, CATEGORY_LABELS, Category } from "@/types";
import api from "@/services/api";
import toast from "react-hot-toast";

const CATEGORIES: [string, string][] = [
  ["", "Todas as categorias"],
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.set("busca", value);
    if (category) params.set("categoria", category);
    router.replace(`/produtos?${params}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams();
    if (search) params.set("busca", search);
    if (value) params.set("categoria", value);
    router.replace(`/produtos?${params}`);
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Produtos</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">Nenhum produto encontrado.</p>
            <button
              onClick={() => { setSearch(""); setCategory(""); }}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">{products.length} produto(s) encontrado(s)</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProdutoCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
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
