"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/types";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import toast from "react-hot-toast";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending", "confirmed", "shipped", "delivered", "cancelled",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = (status = "") => {
    setIsLoading(true);
    const params = status ? `?status=${status}` : "";
    api.get(`/orders/${params}`)
      .then((r) => setOrders(r.data.results ?? r.data))
      .catch(() => toast.error("Erro ao carregar pedidos"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFilterChange = (status: string) => {
    setFilter(status);
    load(status);
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status/`, { status: newStatus });
      toast.success("Status atualizado!");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  const columns = [
    {
      key: "id",
      header: "#",
      render: (o: Order) => <span className="font-mono text-gray-600">#{o.id}</span>,
    },
    {
      key: "user",
      header: "Cliente",
      render: (o: Order) => (
        <div>
          <p className="font-medium text-gray-900">{o.user_username}</p>
          <p className="text-xs text-gray-400">{o.user_email}</p>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Data",
      render: (o: Order) => (
        <span className="text-sm text-gray-600">
          {new Date(o.created_at).toLocaleDateString("pt-BR")}
        </span>
      ),
    },
    {
      key: "total_amount",
      header: "Total",
      render: (o: Order) => (
        <span className="font-semibold text-blue-600">
          R$ {parseFloat(o.total_amount).toFixed(2).replace(".", ",")}
        </span>
      ),
    },
    {
      key: "payment_status",
      header: "Pagamento",
      render: (o: Order) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
          {PAYMENT_STATUS_LABELS[o.payment_status]}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (o: Order) => (
        <select
          value={o.status}
          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
          className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[o.status]}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Pedidos</h1>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange("")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Todos
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={orders}
        isLoading={isLoading}
        keyExtractor={(o) => o.id}
        emptyMessage="Nenhum pedido encontrado."
      />
    </div>
  );
}
