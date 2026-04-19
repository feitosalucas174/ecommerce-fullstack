"use client";

import Image from "next/image";
import { CartItem } from "@/types";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { Button } from "@/components/ui/Button";

interface CarrinhoItemProps {
  item: CartItem;
}

export function CarrinhoItem({ item }: CarrinhoItemProps) {
  const { removeItem, updateQuantity } = useCarrinho();
  const { product, quantity } = item;

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
      {/* Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="truncate font-medium text-gray-900">{product.name}</h3>
        <p className="text-sm text-blue-600 font-semibold">
          R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
        </p>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(product.id, quantity - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md border text-gray-600 hover:bg-gray-100"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => updateQuantity(product.id, quantity + 1)}
          disabled={quantity >= product.stock_quantity}
          className="flex h-8 w-8 items-center justify-center rounded-md border text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <p className="hidden w-24 text-right font-bold text-gray-900 sm:block">
        R$ {(parseFloat(product.price) * quantity).toFixed(2).replace(".", ",")}
      </p>

      {/* Remove */}
      <button
        onClick={() => removeItem(product.id)}
        className="ml-2 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
        aria-label="Remover item"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
