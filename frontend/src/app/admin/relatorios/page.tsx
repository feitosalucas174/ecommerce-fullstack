"use client";

import { useState, useEffect } from "react";
import { SalesData, TopProduct, StockAlert, CATEGORY_LABELS } from "@/types";
import { VendasChart } from "@/components/charts/VendasChart";
import { EstoqueChart } from "@/components/charts/EstoqueChart";
import { Table } from "@/components/ui/Table";
import api from "@/services/api";
import toast from "react-hot-toast";

type Period = "day" | "week" | "month";

export default function AdminRelatoriosPage() {
  const [period, setPeriod] = useState<Period>("day");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = (p: Period) => {
    setIsLoading(true);
    Promise.all([
      api.get(`/reports/sales/?period=${p}`),
      api.get("/reports/top-products/?limit=5"),
      api.get("/reports/stock-alerts/"),
    ])
      .then(([sales, top, alerts]) => {
        setSalesData(sales.data);
        setTopProducts(top.data);
        setStockAlerts(alerts.data);
      })
      .catch(() => toast.error("Erro ao carregar relatórios"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadAll(period); }, [period]);

  const alertColumns = [
    {
      key: "name",
      header: "Produto",
      render: (a: StockAlert) => <span className="font-medium">{a.name}</span>,
    },
    {
      key: "category",
      header: "Categoria",
      render: (a: StockAlert) => CATEGORY_LABELS[a.category],
    },
    {
      key: "stock_quantity",
      header: "Estoque",
      render: (a: StockAlert) => (
        <span className={`font-bold ${a.stock_quantity === 0 ? "text-red-600" : "text-amber-600"}`}>
          {a.stock_quantity}
        </span>
      ),
    },
    {
      key: "min_stock_alert",
      header: "Mínimo",
      render: (a: StockAlert) => <span className="text-gray-500">{a.min_stock_alert}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>

      {/* Sales chart */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Vendas por Período</h2>
          <div className="flex gap-2">
            {(["day", "week", "month"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${period === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {p === "day" ? "Diário" : p === "week" ? "Semanal" : "Mensal"}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        ) : salesData.length === 0 ? (
          <p className="py-12 text-center text-gray-400">Sem dados de vendas para este período.</p>
        ) : (
          <VendasChart data={salesData} />
        )}
      </div>

      {/* Top products */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Top 5 Produtos Mais Vendidos</h2>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        ) : topProducts.length === 0 ? (
          <p className="py-12 text-center text-gray-400">Sem dados de vendas ainda.</p>
        ) : (
          <EstoqueChart data={topProducts} />
        )}
      </div>

      {/* Stock alerts */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Alertas de Estoque
          {stockAlerts.length > 0 && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-sm font-medium text-red-700">
              {stockAlerts.length}
            </span>
          )}
        </h2>
        <Table
          columns={alertColumns}
          data={stockAlerts}
          isLoading={isLoading}
          keyExtractor={(a) => a.id}
          emptyMessage="Nenhum produto com estoque crítico."
        />
      </div>
    </div>
  );
}
