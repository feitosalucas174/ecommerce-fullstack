"use client";

import Link from "next/link";
import Image from "next/image";
import { Product, CATEGORY_LABELS } from "@/types";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { Button } from "@/components/ui/Button";

interface ProdutoCardProps {
  product: Product;
}

export function ProdutoCard({ product }: ProdutoCardProps) {
  const { addItem } = useCarrinho();

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/produtos/${product.id}`} className="block overflow-hidden">
        <div className="relative h-52 w-full bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Category badge */}
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-600">
            {CATEGORY_LABELS[product.category]}
          </span>
          {/* Low stock badge */}
          {product.is_low_stock && product.is_in_stock && (
            <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
              Últimas unidades
            </span>
          )}
          {!product.is_in_stock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                Esgotado
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/produtos/${product.id}`}>
          <h3 className="line-clamp-2 font-medium text-gray-900 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>

        <div className="mt-auto pt-3">
          <p className="text-xl font-bold text-blue-600">
            R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
          </p>
          <Button
            onClick={() => addItem(product)}
            disabled={!product.is_in_stock}
            className="mt-2 w-full"
            size="sm"
          >
            {product.is_in_stock ? "Adicionar ao Carrinho" : "Indisponível"}
          </Button>
        </div>
      </div>
    </div>
  );
}
