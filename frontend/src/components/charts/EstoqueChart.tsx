"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TopProduct } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

interface EstoqueChartProps {
  data: TopProduct[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function EstoqueChart({ data }: EstoqueChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const formatted = data.map((d) => ({
    name: d.product_name.length > 16 ? d.product_name.slice(0, 14) + "…" : d.product_name,
    vendas: d.total_sold,
    receita: Number(d.total_revenue.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f0f0f0"} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }} angle={-20} textAnchor="end" />
        <YAxis tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#6b7280" }} />
        <Tooltip
          contentStyle={{ backgroundColor: isDark ? "#1f2937" : "#fff", border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`, borderRadius: "8px", color: isDark ? "#f3f4f6" : "#111827" }}
          labelStyle={{ color: isDark ? "#f3f4f6" : "#111827" }}
          itemStyle={{ color: isDark ? "#f3f4f6" : "#111827" }}
          formatter={(value: number, name: string) =>
            name === "receita"
              ? [`R$ ${value.toFixed(2).replace(".", ",")}`, "Receita"]
              : [value, "Unidades vendidas"]
          }
        />
        <Bar dataKey="vendas" radius={[4, 4, 0, 0]}>
          {formatted.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
