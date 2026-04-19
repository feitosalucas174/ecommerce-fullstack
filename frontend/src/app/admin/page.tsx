"use client";

import { useState, useEffect } from "react";
import { RevenueReport } from "@/types";
import api from "@/services/api";
import toast from "react-hot-toast";

function StatCard({
  title, value, sub, color,
}: {
  title: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border-l-4 bg-white p-5 shadow-sm ${color}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<RevenueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/revenue/")
      .then((r) => setData(r.data))
      .catch(() => toast.error("Erro ao carregar dashboard"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Receita do Mês"
          value={`R$ ${data?.revenue.this_month.toFixed(2).replace(".", ",") ?? "0,00"}`}
          sub="Pedidos pagos"
          color="border-blue-500"
        />
        <StatCard
          title="Receita Hoje"
          value={`R$ ${data?.revenue.today.toFixed(2).replace(".", ",") ?? "0,00"}`}
          color="border-green-500"
        />
        <StatCard
          title="Pedidos Hoje"
          value={String(data?.orders.today ?? 0)}
          sub={`${data?.orders.pending ?? 0} pendente(s)`}
          color="border-yellow-500"
        />
        <StatCard
          title="Estoque Baixo"
          value={String(data?.low_stock_products ?? 0)}
          sub="produtos abaixo do mínimo"
          color="border-red-500"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total de Pedidos</p>
          <p className="mt-1 text-2xl font-bold">{data?.orders.total ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Receita Total</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            R$ {data?.revenue.total.toFixed(2).replace(".", ",") ?? "0,00"}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pedidos Pendentes</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{data?.orders.pending ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
