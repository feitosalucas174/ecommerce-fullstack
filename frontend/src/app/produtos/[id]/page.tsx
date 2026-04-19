"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Product, CATEGORY_LABELS } from "@/types";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCarrinho();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}/`)
      .then((r) => setProduct(r.data))
      .catch(() => {
        toast.error("Produto não encontrado.");
        router.replace("/produtos");
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/produtos" className="hover:text-blue-600">Produtos</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="relative h-96 overflow-hidden rounded-2xl bg-gray-100">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 w-fit">
              {CATEGORY_LABELS[product.category]}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

            <div className="mt-6">
              <p className="text-3xl font-bold text-blue-600">
                R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
              </p>

              {/* Stock info */}
              {product.is_in_stock ? (
                <p className={`mt-1 text-sm ${product.is_low_stock ? "text-amber-600" : "text-green-600"}`}>
                  {product.is_low_stock
                    ? `Apenas ${product.stock_quantity} em estoque`
                    : `Em estoque (${product.stock_quantity} unidades)`}
                </p>
              ) : (
                <p className="mt-1 text-sm font-medium text-red-600">Fora de estoque</p>
              )}
            </div>

            {/* Quantity selector */}
            {product.is_in_stock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock}
                size="lg"
                className="flex-1"
              >
                {product.is_in_stock ? "Adicionar ao Carrinho" : "Indisponível"}
              </Button>
              <Link href="/carrinho">
                <Button variant="ghost" size="lg">Ver Carrinho</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
