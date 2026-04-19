"use client";

import { useState, FormEvent } from "react";
import { Product, CATEGORY_LABELS, Category } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ProdutoFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

export function ProdutoForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ProdutoFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? "",
    category: initialData?.category ?? "other",
    image_url: initialData?.image_url ?? "",
    stock_quantity: initialData?.stock_quantity ?? 0,
    min_stock_alert: initialData?.min_stock_alert ?? 5,
    is_active: initialData?.is_active ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(form as Partial<Product>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome do produto"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        placeholder="Ex: Smartphone Galaxy Pro"
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/40"
          placeholder="Descreva o produto..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Preço (R$)"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={handleChange}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/40"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="URL da imagem"
        name="image_url"
        type="url"
        value={form.image_url}
        onChange={handleChange}
        placeholder="https://..."
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Estoque"
          name="stock_quantity"
          type="number"
          min="0"
          value={form.stock_quantity}
          onChange={handleChange}
        />
        <Input
          label="Alerta mínimo"
          name="min_stock_alert"
          type="number"
          min="0"
          value={form.min_stock_alert}
          onChange={handleChange}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
          className="rounded"
        />
        Produto ativo (visível na loja)
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {initialData?.id ? "Salvar alterações" : "Criar produto"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
