"use client";

import { useState, useEffect } from "react";
import { Product, CATEGORY_LABELS } from "@/types";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProdutoForm } from "@/components/produto/ProdutoForm";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    api.get("/products/")
      .then((r) => setProducts(r.data.results ?? r.data))
      .catch(() => toast.error("Erro ao carregar produtos"))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (data: Partial<Product>) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await api.put(`/products/${editing.id}/`, data);
        toast.success("Produto atualizado!");
      } else {
        await api.post("/products/", data);
        toast.success("Produto criado!");
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error("Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await api.delete(`/products/${id}/`);
      toast.success("Produto excluído.");
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch {
      toast.error("Erro ao excluir produto.");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Nome",
      render: (p: Product) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{CATEGORY_LABELS[p.category]}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Preço",
      render: (p: Product) => (
        <span className="font-semibold text-blue-600">
          R$ {parseFloat(p.price).toFixed(2).replace(".", ",")}
        </span>
      ),
    },
    {
      key: "stock_quantity",
      header: "Estoque",
      render: (p: Product) => (
        <span className={p.is_low_stock ? "text-red-600 font-semibold" : ""}>
          {p.stock_quantity}
          {p.is_low_stock && " ⚠"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (p: Product) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
          {p.is_active ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: (p: Product) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(p); setModalOpen(true); }}
            className="text-sm text-blue-600 hover:underline"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(p.id)}
            className="text-sm text-red-500 hover:underline"
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produtos</h1>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          + Novo Produto
        </Button>
      </div>

      <Table
        columns={columns}
        data={products}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
        emptyMessage="Nenhum produto cadastrado."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Editar Produto" : "Novo Produto"}
        size="lg"
      >
        <ProdutoForm
          initialData={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          isLoading={saving}
        />
      </Modal>
    </div>
  );
}
