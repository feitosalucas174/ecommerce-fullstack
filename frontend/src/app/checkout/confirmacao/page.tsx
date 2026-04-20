"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { CartItem } from "@/types";

interface OrderConfirmation {
  orderId: number;
  items: CartItem[];
  total: number;
  address: string;
  cardLast4: string;
  cardName: string;
}

const STEPS = [
  { label: "Pedido recebido",    icon: "📋", done: true  },
  { label: "Pagamento aprovado", icon: "✅", done: true  },
  { label: "Em separação",       icon: "📦", done: false },
  { label: "Enviado",            icon: "🚚", done: false },
  { label: "Entregue",           icon: "🎉", done: false },
];

function estimatedDelivery() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function mockTracking(orderId: number) {
  return `BR${String(orderId).padStart(6, "0")}SHOP`;
}

export default function ConfirmacaoPage() {
  const router = useRouter();
  const { clearCart } = useCarrinho();
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("order_confirmation");
    if (!raw) {
      router.replace("/");
      return;
    }
    setOrder(JSON.parse(raw));
    clearCart();
    sessionStorage.removeItem("order_confirmation");
    // Small delay so the animation fires after mount
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!order) return null;

  const tracking = mockTracking(order.orderId);
  const delivery = estimatedDelivery();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* ── Hero card ─────────────────────────────────────── */}
          <div
            className={`rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl p-8 text-center transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Checkmark */}
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 ring-8 ring-green-50 dark:ring-green-900/10">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Pedido confirmado!</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Obrigado pela sua compra. Você receberá atualizações<br className="hidden sm:block" /> por e-mail conforme o pedido avança.
            </p>

            {/* Badges */}
            <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                Pedido <strong className="text-blue-600 dark:text-blue-400">#{order.orderId}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                Rastreio <strong className="font-mono text-gray-900 dark:text-white">{tracking}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 font-medium text-amber-700 dark:text-amber-400">
                🕐 Simulação
              </span>
            </div>
          </div>

          {/* ── Timeline ──────────────────────────────────────── */}
          <div
            className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status do pedido
            </h2>
            <ol className="relative">
              {STEPS.map((step, i) => {
                const isLast = i === STEPS.length - 1;
                const isCurrent = !step.done && (i === 0 || STEPS[i - 1].done);
                return (
                  <li key={step.label} className={`flex gap-4 ${!isLast ? "pb-6" : ""}`}>
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base border-2 ${
                        step.done
                          ? "bg-green-500 border-green-500 text-white"
                          : isCurrent
                          ? "bg-white dark:bg-gray-900 border-blue-500 text-blue-500 animate-pulse"
                          : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                      }`}>
                        {step.done ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm">{step.icon}</span>
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 mt-1 ${step.done ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pt-1.5 pb-1">
                      <p className={`text-sm font-semibold ${
                        step.done
                          ? "text-green-600 dark:text-green-400"
                          : isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Em andamento…</p>
                      )}
                      {step.done && i === 1 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Previsão de entrega: <span className="font-medium text-gray-600 dark:text-gray-300">{delivery}</span>
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ── Items ─────────────────────────────────────────── */}
          <div
            className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-all duration-700 delay-150 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Itens do pedido
            </h2>
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li key={item.product.id} className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                    {item.product.image_url ? (
                      <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300 dark:text-gray-600 text-xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qtd: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                    R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2).replace(".", ",")}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t dark:border-gray-800 pt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total pago</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                R$ {Number(order.total).toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          {/* ── Payment & Shipping ────────────────────────────── */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Payment */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Pagamento</p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white">
                  VISA
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">•••• {order.cardLast4}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.cardName || "Titular"}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Pagamento aprovado</p>
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Entrega</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{order.address}</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Previsão: <span className="font-medium text-gray-700 dark:text-gray-300">{delivery}</span>
              </p>
            </div>
          </div>

          {/* ── Actions ───────────────────────────────────────── */}
          <div
            className={`flex flex-col sm:flex-row gap-3 pb-6 transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Link
              href="/pedidos"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow hover:bg-blue-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Ver meus pedidos
            </Link>
            <Link
              href="/produtos"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Continuar comprando
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
