"use client";

import { useState, useEffect } from "react";
import { Product, CATEGORY_LABELS } from "@/types";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function AdminEstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockQty, setStockQty] = useState(0);
  const [minAlert, setMinAlert] = useState(5);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    api.get("/products/?ordering=stock_quantity")
      .then((r) => setProducts(r.data.results ?? r.data))
      .catch(() => toast.error("Erro ao carregar estoque"))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openEdit = (p: Product) => {
    setEditing(p);
    setStockQty(p.stock_quantity);
    setMinAlert(p.min_stock_alert);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.patch(`/products/${editing.id}/stock/`, {
        stock_quantity: stockQty,
        min_stock_alert: minAlert,
      });
      toast.success("Estoque atualizado!");
      setEditing(null);
      load();
    } catch {
      toast.error("Erro ao atualizar estoque.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Produto",
      render: (p: Product) => (
        <div>
          <p className="font-medium text-gray-900">{p.name}</p>
          <p className="text-xs text-gray-400">{CATEGORY_LABELS[p.category]}</p>
        </div>
      ),
    },
    {
      key: "stock_quantity",
      header: "Qtd. Atual",
      render: (p: Product) => (
        <span className={`text-lg font-bold ${p.stock_quantity === 0 ? "text-red-600" : p.is_low_stock ? "text-amber-600" : "text-green-700"}`}>
          {p.stock_quantity}
        </span>
      ),
    },
    {
      key: "min_stock_alert",
      header: "Mínimo",
      render: (p: Product) => <span className="text-gray-600">{p.min_stock_alert}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (p: Product) => {
        if (p.stock_quantity === 0)
          return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Esgotado</span>;
        if (p.is_low_stock)
          return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">⚠ Crítico</span>;
        return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">OK</span>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      render: (p: Product) => (
        <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
          Atualizar
        </Button>
      ),
    },
  ];

  const alerts = products.filter((p) => p.is_low_stock).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h1>
        {alerts > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            {alerts} produto(s) em estado crítico
          </span>
        )}
      </div>

      <Table
        columns={columns}
        data={products}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
        emptyMessage="Nenhum produto."
      />

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={`Atualizar Estoque — ${editing?.name}`}
      >
        <div className="space-y-4">
          <Input
            label="Quantidade em estoque"
            type="number"
            min={0}
            value={stockQty}
            onChange={(e) => setStockQty(Number(e.target.value))}
          />
          <Input
            label="Quantidade mínima para alerta"
            type="number"
            min={0}
            value={minAlert}
            onChange={(e) => setMinAlert(Number(e.target.value))}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} isLoading={saving} className="flex-1">
              Salvar
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
