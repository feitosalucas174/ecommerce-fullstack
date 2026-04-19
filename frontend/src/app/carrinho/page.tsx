"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarrinhoItem } from "@/components/carrinho/CarrinhoItem";
import { Button } from "@/components/ui/Button";
import { useCarrinho } from "@/contexts/CarrinhoContext";

export default function CarrinhoPage() {
  const { items, totalItems, totalPrice, clearCart } = useCarrinho();

  if (totalItems === 0) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="mb-6 text-gray-300">
            <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Seu carrinho está vazio</h1>
          <p className="mt-2 text-gray-500">Adicione produtos para continuar.</p>
          <Link href="/produtos">
            <Button className="mt-6">Explorar produtos</Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Carrinho</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CarrinhoItem key={item.product.id} item={item} />
            ))}
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:underline"
            >
              Esvaziar carrinho
            </button>
          </div>

          {/* Summary */}
          <div className="rounded-xl border bg-white p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900">Resumo do Pedido</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "itens"})</span>
                <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="text-green-600">Grátis</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button className="mt-6 w-full" size="lg">
                Finalizar Compra
              </Button>
            </Link>
            <Link href="/produtos">
              <Button variant="ghost" className="mt-2 w-full" size="sm">
                Continuar comprando
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
