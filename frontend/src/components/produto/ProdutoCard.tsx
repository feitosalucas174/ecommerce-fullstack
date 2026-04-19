"use client";

import Link from "next/link";
import Image from "next/image";
import { Product, CATEGORY_LABELS } from "@/types";
import { useCarrinho } from "@/contexts/CarrinhoContext";

interface ProdutoCardProps {
  product: Product;
}

export function ProdutoCard({ product }: ProdutoCardProps) {
  const { addItem } = useCarrinho();

  const price = parseFloat(product.price);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-product transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
      {/* Image area */}
      <Link href={`/produtos/${product.id}`} className="relative block overflow-hidden bg-gray-50" style={{ paddingBottom: "75%" }}>
        <div className="absolute inset-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-200">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
            {CATEGORY_LABELS[product.category]}
          </span>
          {product.is_low_stock && product.is_in_stock && (
            <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              ⚡ Últimas unidades
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-gray-800">
              Esgotado
            </span>
          </div>
        )}

        {/* Quick add — appears on hover */}
        {product.is_in_stock && (
          <div className="absolute bottom-3 left-3 right-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.preventDefault(); addItem(product); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-gray-800 active:scale-95 transition-transform"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar ao carrinho
            </button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/produtos/${product.id}`} className="block">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-black text-gray-900">
              R${" "}
              <span>
                {price.toFixed(2).replace(".", ",")}
              </span>
            </p>
            {product.is_in_stock && (
              <p className="text-xs text-gray-400 mt-0.5">
                {product.stock_quantity} em estoque
              </p>
            )}
          </div>

          <button
            onClick={() => addItem(product)}
            disabled={!product.is_in_stock}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Adicionar ao carrinho"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
