"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Order, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
  delivered: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
};

const PAY_COLORS: Record<string, string> = {
  pending: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  failed: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  refunded: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
};

export default function PedidosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    api.get("/orders/")
      .then((r) => setOrders(r.data.results ?? r.data))
      .catch(() => toast.error("Erro ao carregar pedidos"))
      .finally(() => setIsLoading(false));
  }, [user, router]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Meus Pedidos</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400 dark:text-gray-500">
            <p className="text-lg">Você ainda não tem pedidos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${PAY_COLORS[order.payment_status]}`}>
                      {PAYMENT_STATUS_LABELS[order.payment_status]}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{item.product_detail?.name ?? `Produto #${item.product}`} × {item.quantity}</span>
                      <span>R$ {(Number(item.unit_price) * item.quantity).toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t dark:border-gray-700 pt-3 flex justify-between font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">Total</span>
                  <span className="text-blue-600">
                    R$ {parseFloat(order.total_amount).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
