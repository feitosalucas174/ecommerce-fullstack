"use client";

import { useState, useEffect } from "react";
import { RevenueReport } from "@/types";
import api from "@/services/api";
import toast from "react-hot-toast";

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: string;
  color: string;
  trend?: string;
}

function StatCard({ title, value, sub, icon, color, trend }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-10 ${color}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
        </div>
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${color} bg-opacity-10`}>
          {icon}
        </span>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {trend}
        </div>
      )}
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
        <div className="mb-8">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  const fmt = (v: number) =>
    `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Visão geral do negócio em tempo real
        </p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Receita do Mês"
          value={fmt(data?.revenue.this_month ?? 0)}
          sub="pedidos pagos"
          icon="💰"
          color="bg-blue-500"
          trend="Atualizado agora"
        />
        <StatCard
          title="Receita Hoje"
          value={fmt(data?.revenue.today ?? 0)}
          icon="📈"
          color="bg-green-500"
        />
        <StatCard
          title="Pedidos Hoje"
          value={String(data?.orders.today ?? 0)}
          sub={`${data?.orders.pending ?? 0} pendente(s)`}
          icon="🛒"
          color="bg-yellow-500"
        />
        <StatCard
          title="Estoque Crítico"
          value={String(data?.low_stock_products ?? 0)}
          sub="produtos abaixo do mínimo"
          icon="⚠️"
          color="bg-red-500"
        />
      </div>

      {/* Secondary row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total de Pedidos", value: String(data?.orders.total ?? 0), color: "text-gray-900 dark:text-white" },
          { label: "Receita Total",    value: fmt(data?.revenue.total ?? 0),   color: "text-blue-600" },
          { label: "Pedidos Pendentes", value: String(data?.orders.pending ?? 0), color: "text-yellow-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className={`mt-1.5 text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-6 rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Ações rápidas</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/produtos", label: "+ Novo Produto" },
            { href: "/admin/pedidos", label: "Ver Pedidos" },
            { href: "/admin/estoque", label: "Checar Estoque" },
            { href: "/admin/relatorios", label: "Relatórios" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
